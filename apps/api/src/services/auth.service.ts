import bcrypt from 'bcryptjs';
import axios from 'axios';
import { prisma } from '../lib/prisma.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from '../lib/jwt.js';

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
    });

    // Auto-create a default workspace for the new user
    const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${user.id.slice(-6)}`;
    await prisma.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        slug,
        members: { create: { userId: user.id, role: 'owner' } },
      },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
    });

    return { user, accessToken, refreshToken };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

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
};
