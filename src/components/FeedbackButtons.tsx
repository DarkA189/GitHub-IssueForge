// src/components/FeedbackButtons.tsx
'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackButtonsProps {
  issueId: string;
  analysisId?: string;
  onSubmit?: (helpful: boolean) => Promise<void>;
}

export function FeedbackButtons({
  issueId,
  analysisId,
  onSubmit,
}: FeedbackButtonsProps) {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState<boolean | null>(null);

  const handleFeedback = async (helpful: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId,
          analysisId,
          helpful,
        }),
      });

      if (response.ok) {
        setSubmitted(helpful);
        if (onSubmit) await onSubmit(helpful);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700">Was this helpful?</span>
      <button
        onClick={() => handleFeedback(true)}
        disabled={loading}
        className={`flex items-center space-x-1 px-3 py-2 rounded transition ${
          submitted === true
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-gray-100 text-gray-700 hover:bg-green-50 border border-gray-300'
        }`}
      >
        <ThumbsUp size={16} />
        <span>Yes</span>
      </button>
      <button
        onClick={() => handleFeedback(false)}
        disabled={loading}
        className={`flex items-center space-x-1 px-3 py-2 rounded transition ${
          submitted === false
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'bg-gray-100 text-gray-700 hover:bg-red-50 border border-gray-300'
        }`}
      >
        <ThumbsDown size={16} />
        <span>No</span>
      </button>
    </div>
  );
}