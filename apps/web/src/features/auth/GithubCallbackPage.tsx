import { useEffect, useRef } from 'react';
import { useGithubOAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const GithubCallbackPage = () => {
  const githubOAuth = useGithubOAuth();
  const navigate = useNavigate();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) { navigate('/login'); return; }

    githubOAuth.mutate(code, {
      onError: (err) => {
        console.error('GitHub OAuth error:', err);
        navigate('/login');
      },
    });
  }, []);

  if (githubOAuth.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">GitHub sign in failed. Please try again.</p>
          <button onClick={() => navigate('/login')} className="px-4 py-2 bg-blue-600 text-white rounded-md">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Signing you in with GitHub...</p>
      </div>
    </div>
  );
};
