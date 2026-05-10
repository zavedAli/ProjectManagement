import { useParams, Link } from 'react-router-dom';
import { useProject } from '../../hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTask } from '../../hooks/useTasks';
import { useDebounce } from '../../hooks/useDebounce';
import { KanbanBoard } from '../../components/ui/KanbanBoard';
import { RichTextEditor } from '../../components/ui/RichTextEditor2';
import { TaskDetailModal } from '../../components/ui/TaskDetailModal';
import { ProjectInvitations } from '../../components/ui/ProjectInvitations';
import { useState } from 'react';
import type { Task } from '../../types';

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: projectLoading } = useProject(id!);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data: tasks, isLoading: tasksLoading } = useTasks(id!, debouncedSearch || undefined);

  const createTask = useCreateTask(id!);
  const updateTask = useUpdateTask();

  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate(
      { title, description, status: 'todo', priority, dueDate: dueDate || undefined },
      {
        onSuccess: () => {
          setTitle(''); setDescription(''); setPriority('medium'); setDueDate(''); setShowForm(false);
        },
      }
    );
  };

  const handleTaskMove = (taskId: string, newStatus: string, newPosition: number) => {
    updateTask.mutate({ id: taskId, updates: { status: newStatus, position: newPosition } });
  };

  if (projectLoading || tasksLoading) return <div className="p-8">Loading...</div>;
  if (!project) return <div className="p-8">Project not found</div>;

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
            <ProjectInvitations projectId={id!} />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-gray-500 mt-1 font-medium">{project.key}</p>
          </div>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              + New Task
            </button>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Task</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Add a detailed description..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createTask.isPending}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {createTask.isPending ? 'Creating...' : 'Create Task'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <KanbanBoard tasks={tasks || []} onTaskMove={handleTaskMove} onTaskClick={setSelectedTask} />

          {selectedTask && (
            <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
          )}
        </div>
      </main>
    </div>
  );
};
