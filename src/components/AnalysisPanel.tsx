// src/components/AnalysisPanel.tsx
'use client';

import React from 'react';
import { generateSeverityColor, generateConfidenceColor } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AnalysisPanelProps {
  severity: string;
  confidence: number;
  rootCause: string;
  reproductionSteps: string;
  suggestedFix: string;
  status: string;
}

export function AnalysisPanel({
  severity,
  confidence,
  rootCause,
  reproductionSteps,
  suggestedFix,
  status,
}: AnalysisPanelProps) {
  return (
    <div className="space-y-4">
      {status === 'analyzing' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
          <Clock className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800">Analyzing issue with AI...</p>
        </div>
      )}

      {status === 'completed' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Severity</div>
              <div className={`px-3 py-1 rounded font-semibold w-fit ${generateSeverityColor(severity)}`}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Confidence</div>
              <div className={`px-3 py-1 rounded font-semibold w-fit ${generateConfidenceColor(confidence)}`}>
                {(confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <AlertTriangle size={18} className="text-yellow-600" />
              <span>Root Cause</span>
            </h4>
            <p className="text-gray-700 text-sm">{rootCause}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Reproduction Steps</h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
              {reproductionSteps.split('\n').map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <CheckCircle size={18} className="text-green-600" />
              <span>Suggested Fix</span>
            </h4>
            <p className="text-gray-700 text-sm">{suggestedFix}</p>
          </div>
        </>
      )}
    </div>
  );
}