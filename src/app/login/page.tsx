// src/app/login/page.tsx
'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { Github, Zap } from 'lucide-react';
import Image from "next/image";


export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);

  const handleGitHubSignIn = async () => {
    setLoading(true);
    await signIn('github', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/issueforge-icon.png"
              alt="IssueForge Logo"
              width={150}
              height={40}
              priority
              />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">IssueForge</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to start triaging issues with AI
          </p>
        </div>

        <button
          onClick={handleGitHubSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition font-semibold"
        >
          <Github size={20} />
          <span>
            {loading ? 'Connecting...' : 'Sign in with GitHub'}
          </span>
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          We'll only access your repositories with your permission
        </p>
      </div>
    </div>
  );
}
