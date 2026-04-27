// src/components/RepositorySelector.tsx
'use client';

import React from 'react';
import { GitBranch, Loader } from 'lucide-react';

interface Repository {
  name: string;
  full_name: string;
  description?: string;
  html_url?: string;
  owner?: { login: string };
}

interface RepositorySelectorProps {
  onSelect: (repo: Repository & { id?: string }) => void;
  loading?: boolean;
}

export function RepositorySelector({
  onSelect,
  loading = false,
}: RepositorySelectorProps) {
  const [repos, setRepos] = React.useState<Repository[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchRepos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/github/repos');
        if (!response.ok) throw new Error('Failed to fetch repositories');
        const data = await response.json();
        setRepos(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch repositories'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const handleSelect = async (repo: Repository) => {
    try {
      // Save repo to database first to get its ID
      const response = await fetch('/api/github/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: repo.owner?.login,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          url: repo.html_url,
        }),
      });

      if (!response.ok) throw new Error('Failed to save repository');
      const savedRepo = await response.json();

      // Pass the repo with database ID
      onSelect({ ...repo, id: savedRepo.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select repository');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="animate-spin mr-2" size={20} />
        <span>Loading repositories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {repos.map((repo) => (
        <button
          key={repo.full_name}
          onClick={() => handleSelect(repo)}
          disabled={loading}
          className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition disabled:opacity-50"
        >
          <div className="flex items-center space-x-2 mb-1">
            <GitBranch size={16} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">{repo.name}</h3>
          </div>
          <p className="text-sm text-gray-600">{repo.full_name}</p>
          {repo.description && (
            <p className="text-xs text-gray-500 mt-1">{repo.description}</p>
          )}
        </button>
      ))}
    </div>
  );
}