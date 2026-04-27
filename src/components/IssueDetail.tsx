// src/components/IssueDetail.tsx
'use client';

import React from 'react';
import { ExternalLink, Loader, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { AnalysisPanel } from './AnalysisPanel';
import { DiffViewer } from './DiffViewer';
import { FeedbackButtons } from './FeedbackButtons';

interface IssueDetailProps {
  issueId: string;
}

export function IssueDetail({ issueId }: IssueDetailProps) {
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Load existing analysis if available
    const loadAnalysis = async () => {
      try {
        // Analysis is loaded when we fetch the issue
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [issueId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, includeCodeContext: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze issue');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error && !analysis) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-20">
          {!analysis && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition font-medium"
            >
              {analyzing && <Loader size={18} className="animate-spin" />}
              <span>{analyzing ? 'Analyzing...' : 'Run AI Analysis'}</span>
            </button>
          )}

          {analysis && analysis.status === 'completed' && (
            <>
              <FeedbackButtons issueId={issueId} analysisId={analysis.id} />
              <button
                onClick={handleAnalyze}
                className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition font-medium text-sm"
              >
                <span>Re-analyze</span>
              </button>
            </>
          )}

          {analysis && analysis.status === 'analyzing' && (
            <div className="text-center py-6">
              <Loader className="animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Analyzing with Claude AI...</p>
            </div>
          )}

          {analysis && analysis.status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">
                {analysis.errorMessage || 'Analysis failed'}
              </p>
              <button
                onClick={handleAnalyze}
                className="w-full mt-2 px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {analysis && analysis.status === 'completed' ? (
          <>
            <AnalysisPanel
              severity={analysis.severity}
              confidence={analysis.confidence}
              rootCause={analysis.rootCause}
              reproductionSteps={analysis.reproductionSteps}
              suggestedFix={analysis.suggestedFix}
              status={analysis.status}
            />

            {analysis.codeDiff && (
              <DiffViewer
                codeDiff={analysis.codeDiff}
                affectedFiles={analysis.affectedFiles}
              />
            )}

            {analysis.prDescription && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  PR Description
                </h4>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {analysis.prDescription}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(analysis.prDescription);
                    alert('PR description copied to clipboard!');
                  }}
                  className="w-full mt-3 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">
            <p>Click "Run AI Analysis" to analyze this issue with Claude AI</p>
          </div>
        )}
      </div>
    </div>
  );
}