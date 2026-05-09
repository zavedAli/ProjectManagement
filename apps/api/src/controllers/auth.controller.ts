import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { authService } from '../services/auth.service.js';

export const authController = {
  async register(req: AuthRequest, res: Response) {
    try {
      const { email, password, name } = req.body;
      const result = await authService.register(email, password, name);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  },

  async refresh(req: AuthRequest, res: Response) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        res.status(401).json({ error: 'No refresh token' });
        return;
      }

      const result = await authService.refresh(token);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  },

  async logout(req: AuthRequest, res: Response) {
    try {
      const token = req.cookies.refreshToken;
      if (token) await authService.logout(token);

      res.clearCookie('refreshToken');
      res.json({ message: 'Logged out' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async updateAvatar(req: AuthRequest, res: Response) {
    try {
      const { avatarUrl } = req.body;
      if (!avatarUrl) { res.status(400).json({ error: 'avatarUrl required' }); return; }
      const user = await authService.updateAvatar(req.user!.userId, avatarUrl);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async githubOAuth(req: AuthRequest, res: Response) {
    try {
      const { code } = req.body;
      if (!code) { res.status(400).json({ error: 'code required' }); return; }
      const result = await authService.githubOAuth(code);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ user: result.user, accessToken: result.accessToken });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
};
