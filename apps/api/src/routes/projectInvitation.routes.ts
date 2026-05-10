import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { prisma } from '../lib/prisma.js';
import crypto from 'crypto';

const router = Router();

router.get('/projects/:projectId/invitations', authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: { include: { members: { where: { userId } } } } },
    });

    if (!project || project.workspace.members.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const invitations = await prisma.projectInvitation.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invitations);
  } catch (error) {
    next(error);
  }
});

router.post('/projects/:projectId/invitations', authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: { include: { members: { where: { userId } } } } },
    });

    if (!project || project.workspace.members.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const existing = await prisma.projectInvitation.findUnique({
      where: { projectId_email: { projectId, email } },
    });

    if (existing) {
      return res.status(400).json({ error: 'Invitation already sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.projectInvitation.create({
      data: { email, projectId, role, token, expiresAt },
    });

    res.json(invitation);
  } catch (error) {
    next(error);
  }
});

router.delete('/projects/invitations/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const invitation = await prisma.projectInvitation.findUnique({
      where: { id },
      include: { project: { include: { workspace: { include: { members: { where: { userId } } } } } } },
    });

    if (!invitation || invitation.project.workspace.members.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.projectInvitation.delete({ where: { id } });

    res.json({ message: 'Invitation revoked' });
  } catch (error) {
    next(error);
  }
});

export default router;
