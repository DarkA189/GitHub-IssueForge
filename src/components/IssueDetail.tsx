// src/components/IssueDetail.tsx
'use client';

import React from 'react';
import { Loader, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { AnalysisPanel } from './AnalysisPanel';
import { DiffViewer } from './DiffViewer';
import { FeedbackButtons } from './FeedbackButtons';

interface IssueDetailProps {
  issueId: string;
  existingAnalysis?: any;
}

export function IssueDetail({ issueId, existingAnalysis }: IssueDetailProps) {
  const [analysis, setAnalysis] = React.useState<any>(existingAnalysis || null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAnalyze = async (forceReanalyze: boolean = false) => {
    setAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, forceReanalyze }),
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

  const isBasicAnalysis = analysis && (
    analysis.rootCause === 'Automatic classification' ||
    analysis.rootCause === 'Basic analysis (LLM unavailable)' ||
    analysis.confidence <= 0.3
  );

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">AI Analysis</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {analysis && analysis.status === 'completed'
                  ? isBasicAnalysis
                    ? 'Basic analysis only — run AI for deeper insights'
                    : `Analyzed by Groq · ${analysis.analysisTime ? (analysis.analysisTime / 1000).toFixed(1) + 's' : ''}`
                  : 'Analyze this issue with AI to get insights'}
              </p>
            </div>
          </div>

          {!analysis || isBasicAnalysis ? (
            <button
              onClick={() => handleAnalyze(true)}
              disabled={analyzing}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {analyzing ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{analyzing ? 'Analyzing...' : 'Run AI Analysis'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleAnalyze(true)}
              disabled={analyzing}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition"
            >
              {analyzing ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              <span>{analyzing ? 'Re-analyzing...' : 'Re-analyze'}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={16} />
          <div>
            <p className="text-red-800 dark:text-red-300 text-sm font-medium">Analysis failed</p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {analysis && analysis.status === 'completed' && !isBasicAnalysis && (
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
            <DiffViewer codeDiff={analysis.codeDiff} affectedFiles={analysis.affectedFiles} />
          )}
          {analysis.prDescription && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">PR Description</h4>
              </div>
              <div className="p-4">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                  {analysis.prDescription}
                </pre>
              </div>
            </div>
          )}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <FeedbackButtons issueId={issueId} analysisId={analysis.id} />
          </div>
        </>
      )}

      {analysis && analysis.status === 'completed' && isBasicAnalysis && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">Basic Classification Only</p>
          <p className="text-yellow-700 dark:text-yellow-400 text-xs mt-1">
            The AI analysis didn't run successfully. Click "Run AI Analysis" above for a full analysis.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-yellow-100 dark:border-yellow-800">
              <span className="text-xs text-gray-500 dark:text-gray-400">Severity</span>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm capitalize">{analysis.severity}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-yellow-100 dark:border-yellow-800">
              <span className="text-xs text-gray-500 dark:text-gray-400">Confidence</span>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{(analysis.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      )}

      {!analysis && !analyzing && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 border-dashed rounded-lg p-10 text-center">
          <Sparkles size={28} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">No analysis yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Click "Run AI Analysis" to get AI-powered insights</p>
        </div>
      )}
    </div>
  );
}
