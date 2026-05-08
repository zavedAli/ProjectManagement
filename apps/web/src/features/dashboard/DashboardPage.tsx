import { useRef, useState } from 'react';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { Link } from 'react-router-dom';
import { useLogout, useAuth, useUpdateAvatar } from '../../hooks/useAuth';
import { Avatar } from '../../components/ui/Avatar';

export const DashboardPage = () => {
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const workspace = workspaces?.[0];
  const { data: projects } = useProjects(workspace?.id || '');
  const project = projects?.[0];
  const { data: tasks } = useTasks(project?.id || '');
  const logout = useLogout();
  const { data: user } = useAuth();
  const updateAvatar = useUpdateAvatar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateAvatar.mutate(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (workspacesLoading) return <div className="p-8">Loading...</div>;

  if (!workspace) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">No workspaces found</h1>
        <p className="mt-2 text-gray-600">Create a workspace to get started.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Project Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/projects" className="text-gray-700 hover:text-gray-900">Projects</Link>
              <button onClick={() => logout.mutate()} className="text-gray-700 hover:text-gray-900">Logout</button>

              {user && (
                <div className="relative">
                  <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 focus:outline-none">
                    <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-10">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { fileRef.current?.click(); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {updateAvatar.isPending ? 'Uploading...' : 'Change Avatar'}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Workspaces</h3>
              <p className="mt-2 text-3xl font-bold">{workspaces?.length || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Projects</h3>
              <p className="mt-2 text-3xl font-bold">{projects?.length || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Tasks</h3>
              <p className="mt-2 text-3xl font-bold">{tasks?.length || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Recent Projects</h3>
            </div>
            <div className="p-6">
              {projects && projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((p) => (
                    <Link
                      key={p.id}
                      to={`/projects/${p.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.createdBy.name} avatarUrl={p.createdBy.avatarUrl} size="sm" />
                          <div>
                            <h4 className="font-medium">{p.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{p.key}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{p._count?.tasks || 0} tasks</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No projects yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
