import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { notificationService } from '../services/notification.service.js';

export const notificationController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const notifications = await notificationService.getAll(req.user!.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const result = await notificationService.getUnreadCount(req.user!.userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user!.userId);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};
