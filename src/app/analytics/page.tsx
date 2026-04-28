// src/app/analytics/page.tsx
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const fetchAnalytics = async () => {
        try {
          const response = await fetch('/api/analytics');
          if (!response.ok) throw new Error('Failed to fetch analytics');
          const data = await response.json();
          setAnalytics(data);
        } catch (error) {
          console.error('Error fetching analytics:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [status, router]);

  if (status === 'loading' || loading) return <LoadingSpinner />;

  if (!analytics) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No analytics data available yet</p>
      </div>
    );
  }

  const severityData = Object.entries(analytics.severityBreakdown || {}).map(
    ([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      count,
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Analytics</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Analyses</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {analytics.totalAnalyses}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completion Rate</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {analytics.successRate}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Confidence</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {(parseFloat(analytics.avgConfidence) * 100).toFixed(0)}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Helpful Feedback</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {analytics.helpfulFeedback}%
          </div>
        </div>
      </div>

      {severityData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Issues by Severity
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {analytics.topRepositories && analytics.topRepositories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Top Repositories
          </h2>
          <div className="space-y-3">
            {analytics.topRepositories.map((repo: any) => (
              <div key={repo.name} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{repo.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {repo.analysisCount}/{repo.issueCount} analyzed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}