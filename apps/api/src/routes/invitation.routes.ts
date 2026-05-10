import { Router } from 'express';
import { invitationController } from '../controllers/invitation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/workspaces/:workspaceId/invitations', invitationController.sendInvitation);
router.get('/workspaces/:workspaceId/invitations', invitationController.getInvitations);
router.post('/invitations/accept', invitationController.acceptInvitation);
router.delete('/invitations/:id', invitationController.revokeInvitation);

export default router;
