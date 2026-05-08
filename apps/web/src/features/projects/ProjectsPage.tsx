import { useState } from 'react';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { useProjects, useCreateProject, usePrefetchProject } from '../../hooks/useProjects';
import { useDebounce } from '../../hooks/useDebounce';
import { Link } from 'react-router-dom';

export const ProjectsPage = () => {
  const { data: workspaces } = useWorkspaces();
  const workspace = workspaces?.[0];
  const createProject = useCreateProject();
  const prefetchProject = usePrefetchProject();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data: projects, isLoading } = useProjects(workspace?.id || '', debouncedSearch || undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;

    createProject.mutate(
      { workspaceId: workspace.id, name, key },
      {
        onSuccess: () => {
          setName('');
          setKey('');
          setShowForm(false);
        },
      }
    );
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold">
                Project Management
              </Link>
              <Link to="/projects" className="text-gray-900 font-medium">
                Projects
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Projects</h2>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                New Project
              </button>
            </div>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Key</label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value.toUpperCase())}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={createProject.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createProject.isPending ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                onMouseEnter={() => prefetchProject(project.id)}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{project.key}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  {project._count?.tasks || 0} tasks
                </div>
              </Link>
            ))}
          </div>

          {projects?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects yet. Create one to get started!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
