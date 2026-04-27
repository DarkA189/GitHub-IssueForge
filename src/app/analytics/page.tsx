// src/app/analytics/page.tsx
'use client';

import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { redirect, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!analytics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No analytics data available yet</p>
      </div>
    );
  }

  const severityData = Object.entries(analytics.severityBreakdown).map(
    ([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      count,
    })
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Analyses</div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.totalAnalyses}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.successRate}%
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Avg Confidence</div>
          <div className="text-3xl font-bold text-gray-900">
            {(parseFloat(analytics.avgConfidence) * 100).toFixed(0)}%
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Helpful Feedback</div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.helpfulFeedback}%
          </div>
        </div>
      </div>

      {severityData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Issues by Severity
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {analytics.topRepositories.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Top Repositories
          </h2>
          <div className="space-y-3">
            {analytics.topRepositories.map((repo: any) => (
              <div key={repo.name} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="font-medium text-gray-900">{repo.name}</span>
                <span className="text-sm text-gray-600">
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