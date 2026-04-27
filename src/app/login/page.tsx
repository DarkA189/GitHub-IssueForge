// src/app/login/page.tsx
'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { Github } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);

  const handleGitHubSignIn = async () => {
    setLoading(true);
    await signIn('github', { redirect: true, redirectTo: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚡</div>
          <h1 className="text-3xl font-bold text-gray-900">IssueForge</h1>
          <p className="text-gray-600 mt-2">
            Sign in to start triaging issues with AI
          </p>
        </div>

        <button
          onClick={handleGitHubSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition font-semibold"
        >
          <Github size={20} />
          <span>
            {loading ? 'Connecting...' : 'Sign in with GitHub'}
          </span>
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          We'll only access your repositories with your permission
        </p>
      </div>
    </div>
  );
}