// src/components/IssueCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { truncate, timeAgo, generateSeverityColor } from '@/lib/utils';
import { AlertCircle, Clock } from 'lucide-react';

interface IssueCardProps {
  id: string;
  title: string;
  body?: string;
  author?: string;
  severity?: string;
  confidence?: number;
  hasAnalysis: boolean;
  analysisStatus?: string;
  createdAt: Date;
}

export function IssueCard({
  id,
  title,
  body,
  author,
  severity,
  confidence,
  hasAnalysis,
  analysisStatus,
  createdAt,
}: IssueCardProps) {
  return (
    <Link href={`/issue/${id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex-1 line-clamp-2">
            {title}
          </h3>
          {severity && (
            <span
              className={`ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${generateSeverityColor(
                severity
              )}`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </span>
          )}
        </div>

        {body && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {truncate(body, 100)}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock size={14} />
            <span>{timeAgo(createdAt)}</span>
            {author && <span>by {author}</span>}
          </div>

          {hasAnalysis && (
            <div className="flex items-center space-x-1">
              <AlertCircle size={14} />
              {analysisStatus === 'analyzing' && (
                <span className="text-blue-600">Analyzing...</span>
              )}
              {analysisStatus === 'completed' && confidence && (
                <span className="text-green-600">
                  {(confidence * 100).toFixed(0)}% confident
                </span>
              )}
              {analysisStatus === 'failed' && (
                <span className="text-red-600">Analysis failed</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}