// src/components/FeedbackButtons.tsx
'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackButtonsProps {
  issueId: string;
  analysisId?: string;
}

export function FeedbackButtons({ issueId, analysisId }: FeedbackButtonsProps) {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState<boolean | null>(null);

  const handleFeedback = async (helpful: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, analysisId, helpful }),
      });
      if (response.ok) setSubmitted(helpful);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">Was this helpful?</span>
      <button
        onClick={() => handleFeedback(true)}
        disabled={loading || submitted !== null}
        className={`flex items-center space-x-1 px-3 py-2 rounded transition text-sm ${
          submitted === true
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-300 dark:border-gray-600'
        } disabled:opacity-60`}
      >
        <ThumbsUp size={14} />
        <span>Yes</span>
      </button>
      <button
        onClick={() => handleFeedback(false)}
        disabled={loading || submitted !== null}
        className={`flex items-center space-x-1 px-3 py-2 rounded transition text-sm ${
          submitted === false
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-300 dark:border-gray-600'
        } disabled:opacity-60`}
      >
        <ThumbsDown size={14} />
        <span>No</span>
      </button>
    </div>
  );
}
