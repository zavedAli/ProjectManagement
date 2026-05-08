import { useParams, Link } from 'react-router-dom';
import { useProject } from '../../hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTask } from '../../hooks/useTasks';
import { useDebounce } from '../../hooks/useDebounce';
import { Avatar } from '../../components/ui/Avatar';
import { useState } from 'react';
import type { Task } from '../../types';

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

const isOverdue = (dueDate?: string) => !!dueDate && new Date(dueDate) < new Date();
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

type SortKey = 'default' | 'dueDate' | 'priority' | 'assignee';

const sortTasks = (tasks: Task[], sortBy: SortKey): Task[] => {
  if (sortBy === 'default') return tasks;
  return [...tasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (sortBy === 'assignee') return (a.assignee?.name || '').localeCompare(b.assignee?.name || '');
    return 0;
  });
};

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: projectLoading } = useProject(id!);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const debouncedSearch = useDebounce(search);
  const { data: tasks, isLoading: tasksLoading } = useTasks(id!, debouncedSearch || undefined);

  const createTask = useCreateTask(id!);
  const updateTask = useUpdateTask();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate(
      { title, status: 'todo', priority, dueDate: dueDate || undefined },
      {
        onSuccess: () => {
          setTitle(''); setPriority('medium'); setDueDate(''); setShowForm(false);
        },
      }
    );
  };

  const handleStatusChange = (task: Task, newStatus: string) => {
    updateTask.mutate({ id: task.id, updates: { status: newStatus } });
  };

  if (projectLoading || tasksLoading) return <div className="p-8">Loading...</div>;
  if (!project) return <div className="p-8">Project not found</div>;

  const tasksByStatus = {
    todo: sortTasks(tasks?.filter((t) => t.status === 'todo') || [], sortBy),
    in_progress: sortTasks(tasks?.filter((t) => t.status === 'in_progress') || [], sortBy),
    done: sortTasks(tasks?.filter((t) => t.status === 'done') || [], sortBy),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold">Project Management</Link>
              <Link to="/projects" className="text-gray-700 hover:text-gray-900">Projects</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <p className="text-gray-600">{project.key}</p>
          </div>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              New Task
            </button>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Sort: Default</option>
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="assignee">Sort: Assignee</option>
            </select>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={createTask.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createTask.isPending ? 'Creating...' : 'Create'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['todo', 'in_progress', 'done'] as const).map((status) => (
              <div key={status} className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-medium mb-4 capitalize">
                  {status.replace('_', ' ')} ({tasksByStatus[status].length})
                </h3>
                <div className="space-y-3">
                  {tasksByStatus[status].map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white p-4 rounded shadow ${isOverdue(task.dueDate) && status !== 'done' ? 'border-l-4 border-red-500' : ''}`}
                    >
                      <h4 className="font-medium">{task.title}</h4>

                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className={`text-xs ${isOverdue(task.dueDate) && status !== 'done' ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                            {isOverdue(task.dueDate) && status !== 'done' ? '⚠ ' : ''}Due {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>

                      {task.assignee && (
                        <div className="mt-2 flex items-center gap-2">
                          <Avatar name={task.assignee.name} avatarUrl={task.assignee.avatarUrl} size="sm" />
                          <span className="text-sm text-gray-600">{task.assignee.name}</span>
                        </div>
                      )}

                      <div className="mt-3 flex space-x-2">
                        {status !== 'todo' && (
                          <button
                            onClick={() => handleStatusChange(task, status === 'done' ? 'in_progress' : 'todo')}
                            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >←</button>
                        )}
                        {status !== 'done' && (
                          <button
                            onClick={() => handleStatusChange(task, status === 'todo' ? 'in_progress' : 'done')}
                            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >→</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
