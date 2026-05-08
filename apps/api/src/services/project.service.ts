import { prisma } from '../lib/prisma.js';

export const projectService = {
  async getAll(workspaceId: string, userId: string, search?: string) {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId },
    });
    if (!member) throw new Error('Unauthorized');

    return prisma.project.findMany({
      where: { workspaceId, archived: false, ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}) },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        workspace: { include: { members: { where: { userId } } } },
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, avatarUrl: true } },
            labels: { include: { label: true } },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!project || project.workspace.members.length === 0) {
      throw new Error('Project not found');
    }

    return project;
  },

  async create(workspaceId: string, userId: string, data: { name: string; key: string; description?: string }) {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId },
    });
    if (!member) throw new Error('Unauthorized');

    return prisma.project.create({
      data: { ...data, workspaceId, createdById: userId },
      include: { createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
  },

  async update(id: string, userId: string, data: { name?: string; description?: string; archived?: boolean }) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { workspace: { include: { members: { where: { userId } } } } },
    });

    if (!project || project.workspace.members.length === 0) {
      throw new Error('Unauthorized');
    }

    return prisma.project.update({ where: { id }, data });
  },

  async delete(id: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { workspace: { include: { members: { where: { userId, role: { in: ['owner', 'admin'] } } } } } },
    });

    if (!project || project.workspace.members.length === 0) {
      throw new Error('Unauthorized');
    }

    await prisma.project.delete({ where: { id } });
  },
};
