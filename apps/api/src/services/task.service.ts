import { prisma } from '../lib/prisma.js';

export const taskService = {
  async getAll(projectId: string, userId: string, search?: string, sortBy?: string, sortOrder?: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: { include: { members: { where: { userId } } } } },
    });

    if (!project || project.workspace.members.length === 0) {
      throw new Error('Unauthorized');
    }

    return prisma.task.findMany({
      where: { projectId, ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}) },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        labels: { include: { label: true } },
        _count: { select: { comments: true } },
      },
      orderBy: sortBy === 'dueDate'
        ? { dueDate: (sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc' }
        : sortBy === 'priority'
        ? { priority: (sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc' }
        : { position: 'asc' },
    });
  },

  async getById(id: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { include: { workspace: { include: { members: { where: { userId } } } } } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        labels: { include: { label: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!task || task.project.workspace.members.length === 0) {
      throw new Error('Task not found');
    }

    return task;
  },

  async create(projectId: string, userId: string, data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
  }) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: { include: { members: { where: { userId } } } } },
    });

    if (!project || project.workspace.members.length === 0) {
      throw new Error('Unauthorized');
    }

    const maxPosition = await prisma.task.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const task = await prisma.task.create({
      data: {
        ...data,
        projectId,
        createdById: userId,
        position: (maxPosition?.position ?? 0) + 1,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        labels: { include: { label: true } },
      },
    });

    await prisma.activity.create({
      data: {
        type: 'created',
        content: `created this task`,
        taskId: task.id,
        userId,
      },
    });

    return task;
  },

  async update(id: string, userId: string, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
    position?: number;
  }) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { include: { workspace: { include: { members: { where: { userId } } } } } } },
    });

    if (!task || task.project.workspace.members.length === 0) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        labels: { include: { label: true } },
      },
    });

    if (data.status && data.status !== task.status) {
      await prisma.activity.create({
        data: {
          type: 'status_changed',
          content: `changed status from ${task.status} to ${data.status}`,
          taskId: id,
          userId,
        },
      });
    }

    return updated;
  },

  async delete(id: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { include: { workspace: { include: { members: { where: { userId } } } } } } },
    });

    if (!task || task.project.workspace.members.length === 0) {
      throw new Error('Unauthorized');
    }

    await prisma.task.delete({ where: { id } });
  },

  async addComment(taskId: string, userId: string, content: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { workspace: { include: { members: { where: { userId } } } } } } },
    });

    if (!task || task.project.workspace.members.length === 0) {
      throw new Error('Unauthorized');
    }

    const comment = await prisma.comment.create({
      data: { content, taskId, userId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await prisma.activity.create({
      data: {
        type: 'commented',
        content: `added a comment`,
        taskId,
        userId,
      },
    });

    return comment;
  },
};
