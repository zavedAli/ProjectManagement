import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { workspaceService } from '../services/workspace.service.js';

export const workspaceController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const workspaces = await workspaceService.getAll(req.user!.userId);
      res.json(workspaces);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const workspace = await workspaceService.getById(String(req.params.id), req.user!.userId);
      res.json(workspace);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { name, slug } = req.body;
      const workspace = await workspaceService.create(name, slug, req.user!.userId);
      res.status(201).json(workspace);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const workspace = await workspaceService.update(String(req.params.id), req.user!.userId, req.body);
      res.json(workspace);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
};
