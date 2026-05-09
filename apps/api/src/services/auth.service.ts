import bcrypt from 'bcryptjs';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { emailService } from '../lib/email.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from '../lib/jwt.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, otp, otpExpiry, emailVerified: false },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true, emailVerified: true },
    });

    // Send OTP email
    await emailService.sendOTP(email, otp, name);

    return { user, message: 'Please check your email for verification code' };
  },

  async verifyOTP(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    if (user.emailVerified) throw new Error('Email already verified');
    if (!user.otp || !user.otpExpiry) throw new Error('No OTP found');
    if (user.otpExpiry < new Date()) throw new Error('OTP expired');
    if (user.otp !== otp) throw new Error('Invalid OTP');

    // Mark as verified and clear OTP
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true, otp: null, otpExpiry: null },
    });

    // Auto-create workspace
    const slug = `${user.name.toLowerCase().replace(/\s+/g, '-')}-${user.id.slice(-6)}`;
    await prisma.workspace.create({
      data: {
        name: `${user.name}'s Workspace`,
        slug,
        members: { create: { userId: user.id, role: 'owner' } },
      },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
    });

    return {
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      accessToken,
      refreshToken,
    };
  },

  async resendOTP(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    if (user.emailVerified) throw new Error('Email already verified');

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    await emailService.sendOTP(email, otp, user.name);
    return { message: 'OTP resent successfully' };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    if (!user.emailVerified) throw new Error('Please verify your email first');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      accessToken,
      refreshToken,
    };
  },

  async refresh(token: string) {
    const payload = verifyRefreshToken(token);
    const stored = await prisma.refreshToken.findUnique({ where: { token } });

    if (!stored || stored.expiresAt < new Date()) {
      throw new Error('Invalid refresh token');
    }

    const accessToken = generateAccessToken({ userId: payload.userId, email: payload.email });
    return { accessToken };
  },

  async logout(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  },

  async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
    });
  },

  async updateAvatar(userId: string, avatarUrl: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
    });
  },

  async githubOAuth(code: string) {
    // Exchange code for access token
    const { data: tokenData } = await axios.post(
      'https://github.com/login/oauth/access_token',
      { client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code },
      { headers: { Accept: 'application/json' } }
    );

    if (tokenData.error) throw new Error(`GitHub OAuth failed: ${tokenData.error_description || tokenData.error}`);

    // Get GitHub user info
    const { data: githubUser } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    // Get primary email if not public
    let email = githubUser.email;
    if (!email) {
      const { data: emails } = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      email = emails.find((e: { primary: boolean; email: string }) => e.primary)?.email;
    }

    if (!email) throw new Error('No email found on GitHub account');

    // Upsert user
    let user = await prisma.user.findUnique({ where: { email } });
    const isNewUser = !user;

    if (!user) {
      user = await prisma.user.create({
        data: { email, name: githubUser.name || githubUser.login, password: '', avatarUrl: githubUser.avatar_url },
      });
    } else {
      user = await prisma.user.update({
        where: { email },
        data: { avatarUrl: githubUser.avatar_url },
      });
    }

    // Auto-create workspace for new users
    if (isNewUser) {
      const slug = `${user.name.toLowerCase().replace(/\s+/g, '-')}-${user.id.slice(-6)}`;
      await prisma.workspace.create({
        data: {
          name: `${user.name}'s Workspace`,
          slug,
          members: { create: { userId: user.id, role: 'owner' } },
        },
      });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
    });

    return {
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      accessToken,
      refreshToken,
    };
  },

  async googleOAuth(token: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new Error('Invalid Google token');

    const { email, name, picture } = payload;

    // Upsert user
    let user = await prisma.user.findUnique({ where: { email } });
    const isNewUser = !user;

    if (!user) {
      user = await prisma.user.create({
        data: { email, name: name || email.split('@')[0], password: '', avatarUrl: picture, emailVerified: true },
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { email },
        data: { emailVerified: true, avatarUrl: picture },
      });
    }

    // Auto-create workspace for new users
    if (isNewUser) {
      const slug = `${user.name.toLowerCase().replace(/\s+/g, '-')}-${user.id.slice(-6)}`;
      await prisma.workspace.create({
        data: {
          name: `${user.name}'s Workspace`,
          slug,
          members: { create: { userId: user.id, role: 'owner' } },
        },
      });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
    });

    return {
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      accessToken,
      refreshToken,
    };
  },
};
