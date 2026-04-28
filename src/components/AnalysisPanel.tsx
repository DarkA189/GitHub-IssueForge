// src/components/AnalysisPanel.tsx
'use client';

import React from 'react';
import { generateSeverityColor, generateConfidenceColor } from '@/lib/utils';
import { AlertTriangle, Clock, Target, ListOrdered, Wrench } from 'lucide-react';

interface AnalysisPanelProps {
  severity: string;
  confidence: number;
  rootCause: string;
  reproductionSteps: string;
  suggestedFix: string;
  status: string;
}

export function AnalysisPanel({
  severity, confidence, rootCause, reproductionSteps, suggestedFix, status,
}: AnalysisPanelProps) {
  if (status === 'analyzing') {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center space-x-3">
        <Clock className="text-blue-600 dark:text-blue-400 flex-shrink-0 animate-pulse" size={18} />
        <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">Analyzing issue with AI...</p>
      </div>
    );
  }

  if (status !== 'completed') return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Severity</span>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${generateSeverityColor(severity)}`}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Confidence</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${generateConfidenceColor(confidence)}`}>
              {(confidence * 100).toFixed(0)}%
            </span>
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center space-x-2">
          <AlertTriangle size={14} className="text-amber-500" />
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Root Cause</h4>
        </div>
        <div className="px-4 py-3">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{rootCause}</p>
        </div>
      </div>

      {reproductionSteps && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center space-x-2">
            <ListOrdered size={14} className="text-blue-500" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Reproduction Steps</h4>
          </div>
          <div className="px-4 py-3">
            <ol className="list-decimal list-inside space-y-1.5 text-gray-700 dark:text-gray-300 text-sm">
              {reproductionSteps.split('\n').filter(s => s.trim()).map((step, i) => (
                <li key={i} className="leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {suggestedFix && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center space-x-2">
            <Wrench size={14} className="text-green-600 dark:text-green-500" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Suggested Fix</h4>
          </div>
          <div className="px-4 py-3">
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{suggestedFix}</p>
          </div>
        </div>
      )}
    </div>
  );
}
