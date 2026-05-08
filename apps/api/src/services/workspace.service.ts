import { prisma } from '../lib/prisma.js';

export const workspaceService = {
  async getAll(userId: string) {
    return prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        _count: { select: { projects: true } },
      },
    });
  },

  async getById(id: string, userId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: { id, members: { some: { userId } } },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        projects: { where: { archived: false }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!workspace) throw new Error('Workspace not found');
    return workspace;
  },

  async create(name: string, slug: string, userId: string) {
    return prisma.workspace.create({
      data: {
        name,
        slug,
        members: { create: { userId, role: 'owner' } },
      },
      include: { members: true },
    });
  },

  async update(id: string, userId: string, data: { name?: string; description?: string }) {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId: id, userId, role: { in: ['owner', 'admin'] } },
    });
    if (!member) throw new Error('Unauthorized');

    return prisma.workspace.update({ where: { id }, data });
  },
};
