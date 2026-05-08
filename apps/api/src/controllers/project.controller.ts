import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { projectService } from '../services/project.service.js';

export const projectController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { workspaceId, search } = req.query;
      if (!workspaceId) {
        res.status(400).json({ error: 'workspaceId required' });
        return;
      }
      const projects = await projectService.getAll(workspaceId as string, req.user!.userId, search as string | undefined);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const project = await projectService.getById(String(req.params.id), req.user!.userId);
      res.json(project);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { workspaceId, name, key, description } = req.body;
      const project = await projectService.create(workspaceId, req.user!.userId, { name, key, description });
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const project = await projectService.update(String(req.params.id), req.user!.userId, req.body);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      await projectService.delete(String(req.params.id), req.user!.userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
};
