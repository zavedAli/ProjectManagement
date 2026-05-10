import { prisma } from '../lib/prisma.js';
import { sendEmail } from '../lib/email.js';
import crypto from 'crypto';

export const invitationService = {
  async sendInvitation(workspaceId: string, email: string, role: string, inviterId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { where: { userId: inviterId } } },
    });

    if (!workspace || workspace.members.length === 0) {
      throw new Error('Unauthorized');
    }

    const existingMember = await prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email } },
    });

    if (existingMember) {
      throw new Error('User already a member');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.workspaceInvitation.upsert({
      where: { workspaceId_email: { workspaceId, email } },
      update: { token, expiresAt, role },
      create: { workspaceId, email, role, token, expiresAt },
    });

    const inviteUrl = `${process.env.FRONTEND_URL}/invitations/accept?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: `Invitation to join ${workspace.name}`,
      html: `
        <h2>You've been invited to join ${workspace.name}</h2>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteUrl}">${inviteUrl}</a>
        <p>This invitation expires in 7 days.</p>
      `,
    });

    return invitation;
  },

  async acceptInvitation(token: string, userId: string) {
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invitation) {
      throw new Error('Invalid invitation');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation expired');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== invitation.email) {
      throw new Error('Invitation email mismatch');
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role,
      },
      include: { workspace: true, user: true },
    });

    await prisma.workspaceInvitation.delete({ where: { id: invitation.id } });

    return member;
  },

  async getInvitations(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { where: { userId } } },
    });

    if (!workspace || workspace.members.length === 0) {
      throw new Error('Unauthorized');
    }

    return prisma.workspaceInvitation.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async revokeInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
      include: { workspace: { include: { members: { where: { userId } } } } },
    });

    if (!invitation || invitation.workspace.members.length === 0) {
      throw new Error('Unauthorized');
    }

    await prisma.workspaceInvitation.delete({ where: { id: invitationId } });
  },
};
