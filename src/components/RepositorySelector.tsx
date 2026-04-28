// src/components/RepositorySelector.tsx
'use client';

import React from 'react';
import { GitBranch, Loader, Search, Lock, Globe, Star } from 'lucide-react';

interface Repository {
  name: string;
  full_name: string;
  description?: string;
  html_url?: string;
  owner?: { login: string };
  private?: boolean;
  stargazers_count?: number;
  language?: string;
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
  const [searchQuery, setSearchQuery] = React.useState('');

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
      onSelect({ ...repo, id: savedRepo.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select repository');
    }
  };

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const languageColors: Record<string, string> = {
    TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5',
    Java: '#b07219', Go: '#00ADD8', Rust: '#dea584', C: '#555555',
    'C++': '#f34b7d', Ruby: '#701516', PHP: '#4F5D95',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader className="animate-spin mr-3 text-gray-400" size={20} />
        <span className="text-gray-500 dark:text-gray-400">Loading repositories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-300 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Your Repositories</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select a repository to view and analyze its issues</p>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Find a repository..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
        {filteredRepos.map((repo) => (
          <button
            key={repo.full_name}
            onClick={() => handleSelect(repo)}
            disabled={loading}
            className="w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 dark:hover:bg-gray-700/50 transition disabled:opacity-50 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline truncate">
                    {repo.name}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                    {repo.private ? (
                      <><Lock size={10} className="mr-1" />Private</>
                    ) : (
                      <><Globe size={10} className="mr-1" />Public</>
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{repo.full_name}</p>
                {repo.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{repo.description}</p>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  {repo.language && (
                    <span className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: languageColors[repo.language] || '#8b8b8b' }}
                      />
                      <span>{repo.language}</span>
                    </span>
                  )}
                  {repo.stargazers_count !== undefined && repo.stargazers_count > 0 && (
                    <span className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <Star size={12} />
                      <span>{repo.stargazers_count}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
          No repositories match your search
        </div>
      )}
    </div>
  );
}
