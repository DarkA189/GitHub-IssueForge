// src/components/IssueCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { timeAgo, generateSeverityColor } from '@/lib/utils';
import { CircleDot, Sparkles } from 'lucide-react';

interface IssueCardProps {
  id: string;
  title: string;
  body?: string;
  author?: string;
  issueNumber?: number;
  severity?: string;
  confidence?: number;
  hasAnalysis: boolean;
  analysisStatus?: string;
  createdAt: Date;
  isLast?: boolean;
}

export function IssueCard({
  id, title, author, issueNumber, severity, confidence,
  hasAnalysis, analysisStatus, createdAt, isLast = false,
}: IssueCardProps) {
  return (
    <Link href={`/issue/${id}`}>
      <div className={`px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer ${!isLast ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
        <div className="flex items-start space-x-3">
          <CircleDot size={16} className="text-green-600 dark:text-green-500 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm leading-tight">
                  {title}
                </span>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {severity && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${generateSeverityColor(severity)}`}>
                      {severity}
                    </span>
                  )}
                  {hasAnalysis && analysisStatus === 'completed' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                      <Sparkles size={10} className="mr-1" />
                      AI Analyzed
                    </span>
                  )}
                </div>
              </div>
              {hasAnalysis && analysisStatus === 'completed' && confidence !== undefined && (
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap mt-1">
                  {(confidence * 100).toFixed(0)}% confidence
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {issueNumber && <span>#{issueNumber}</span>}
              <span>opened {timeAgo(createdAt)}</span>
              {author && <span>by {author}</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
