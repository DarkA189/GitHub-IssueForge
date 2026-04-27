// src/components/IssueDashboard.tsx
'use client';

import React from 'react';
import { IssueCard } from './IssueCard';
import { LoadingSpinner } from './LoadingSpinner';
import { RepositorySelector } from './RepositorySelector';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  body?: string;
  author?: string;
  state: string;
  url: string;
  createdAt: Date;
  analysis?: {
    id: string;
    severity?: string;
    confidence?: number;
    status: string;
  };
}

interface IssueDashboardProps {
  repositoryId?: string;
}

export function IssueDashboard({ repositoryId }: IssueDashboardProps) {
  const [issues, setIssues] = React.useState<Issue[]>([]);
  const [selectedRepo, setSelectedRepo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchIssues = React.useCallback(async (repoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/github/issues?repoId=${repoId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch issues');
      }
      const data = await response.json();
      setIssues(
        data.map((issue: any) => ({
          ...issue,
          createdAt: new Date(issue.createdAt),
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch issues'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRepositorySelect = async (repo: any) => {
    setSelectedRepo(repo);
    if (repo.id) {
      await fetchIssues(repo.id);
    }
  };

  if (!selectedRepo) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Select a Repository
        </h2>
        <RepositorySelector onSelect={handleRepositorySelect} loading={loading} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedRepo.full_name}
          </h2>
          <p className="text-gray-600 mt-1">
            {issues.length} open issue{issues.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => selectedRepo.id && fetchIssues(selectedRepo.id)}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {!loading && issues.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No open issues found</p>
        </div>
      )}

      {!loading && issues.length > 0 && (
        <div className="grid gap-3">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              id={issue.id}
              title={issue.title}
              body={issue.body}
              author={issue.author}
              severity={issue.analysis?.severity}
              confidence={issue.analysis?.confidence}
              hasAnalysis={!!issue.analysis}
              analysisStatus={issue.analysis?.status}
              createdAt={issue.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}