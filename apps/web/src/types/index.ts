export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMember[];
  _count?: { projects: number };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  user: User;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  workspaceId: string;
  createdById: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;
  assigneeId?: string;
  createdById: string;
  dueDate?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  createdBy: User;
  labels?: TaskLabel[];
  comments?: Comment[];
  _count?: { comments: number };
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface TaskLabel {
  taskId: string;
  labelId: string;
  label: Label;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: string;
  content: string;
  taskId: string;
  userId: string;
  user: { id: string; name: string };
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  dueDate?: string;
  position?: number;
}
