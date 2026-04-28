// src/components/IssueDashboard.tsx
'use client';

import React from 'react';
import { IssueCard } from './IssueCard';
import { LoadingSpinner } from './LoadingSpinner';
import { RepositorySelector } from './RepositorySelector';
import { RefreshCw, AlertCircle, ArrowLeft, Search, CircleDot } from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  body?: string;
  author?: string;
  state: string;
  url: string;
  githubIssueNumber: number;
  createdAt: Date;
  analysis?: {
    id: string;
    severity?: string;
    confidence?: number;
    status: string;
  };
}

export function IssueDashboard() {
  const [issues, setIssues] = React.useState<Issue[]>([]);
  const [selectedRepo, setSelectedRepo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

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
      setError(err instanceof Error ? err.message : 'Failed to fetch issues');
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

  const handleBackToRepos = () => {
    setSelectedRepo(null);
    setIssues([]);
    setError(null);
    setSearchQuery('');
  };

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (issue.body && issue.body.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const analyzedCount = issues.filter(i => i.analysis?.status === 'completed').length;

  if (!selectedRepo) {
    return <RepositorySelector onSelect={handleRepositorySelect} loading={loading} />;
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={handleBackToRepos}
          className="inline-flex items-center space-x-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition font-medium"
        >
          <ArrowLeft size={16} />
          <span>Back to repositories</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <CircleDot size={18} className="text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedRepo.full_name || selectedRepo.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {issues.length} open issue{issues.length !== 1 ? 's' : ''} · {analyzedCount} analyzed
                </p>
              </div>
            </div>
            <button
              onClick={() => selectedRepo.id && fetchIssues(selectedRepo.id)}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition font-medium"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter issues..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 flex items-start space-x-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {!loading && issues.length === 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          <CircleDot size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No open issues found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">This repository has no open issues to analyze</p>
        </div>
      )}

      {!loading && filteredIssues.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {filteredIssues.map((issue, index) => (
            <IssueCard
              key={issue.id}
              id={issue.id}
              title={issue.title}
              body={issue.body}
              author={issue.author}
              issueNumber={issue.githubIssueNumber}
              severity={issue.analysis?.severity}
              confidence={issue.analysis?.confidence}
              hasAnalysis={!!issue.analysis}
              analysisStatus={issue.analysis?.status}
              createdAt={issue.createdAt}
              isLast={index === filteredIssues.length - 1}
            />
          ))}
        </div>
      )}

      {!loading && issues.length > 0 && filteredIssues.length === 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No issues match your search</p>
        </div>
      )}
    </div>
  );
}
