import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { invitationService } from '../services/invitation.service.js';

export const invitationController = {
  async sendInvitation(req: AuthRequest, res: Response) {
    try {
      const { workspaceId } = req.params;
      const { email, role } = req.body;
      const invitation = await invitationService.sendInvitation(workspaceId, email, role, req.user!.userId);
      res.status(201).json(invitation);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async acceptInvitation(req: AuthRequest, res: Response) {
    try {
      const { token } = req.body;
      const member = await invitationService.acceptInvitation(token, req.user!.userId);
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async getInvitations(req: AuthRequest, res: Response) {
    try {
      const { workspaceId } = req.params;
      const invitations = await invitationService.getInvitations(workspaceId, req.user!.userId);
      res.json(invitations);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async revokeInvitation(req: AuthRequest, res: Response) {
    try {
      await invitationService.revokeInvitation(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
};
