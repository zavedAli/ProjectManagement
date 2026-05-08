import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { taskService } from '../services/task.service.js';

export const taskController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { projectId, search, sortBy, sortOrder } = req.query;
      if (!projectId) {
        res.status(400).json({ error: 'projectId required' });
        return;
      }
      const tasks = await taskService.getAll(projectId as string, req.user!.userId, search as string | undefined, sortBy as string | undefined, sortOrder as string | undefined);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const task = await taskService.getById(String(req.params.id), req.user!.userId);
      res.json(task);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { projectId, ...data } = req.body;
      const task = await taskService.create(projectId, req.user!.userId, data);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const task = await taskService.update(String(req.params.id), req.user!.userId, req.body);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      await taskService.delete(String(req.params.id), req.user!.userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async addComment(req: AuthRequest, res: Response) {
    try {
      const { content } = req.body;
      const comment = await taskService.addComment(String(req.params.id), req.user!.userId, content);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
};
