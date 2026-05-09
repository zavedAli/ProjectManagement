import { useEffect } from 'react';
import { useGithubOAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const GithubCallbackPage = () => {
  const githubOAuth = useGithubOAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) { navigate('/login'); return; }
    githubOAuth.mutate(code, { onError: () => navigate('/login') });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Signing you in with GitHub...</p>
      </div>
    </div>
  );
};
