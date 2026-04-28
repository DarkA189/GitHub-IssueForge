// src/components/DiffViewer.tsx
'use client';

import React from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

interface DiffViewerProps {
  codeDiff: string;
  affectedFiles?: string[];
}

export function DiffViewer({ codeDiff, affectedFiles }: DiffViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeDiff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = codeDiff.split('\n');

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileCode size={14} className="text-gray-500 dark:text-gray-400" />
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Suggested Changes</h4>
          {affectedFiles && affectedFiles.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {affectedFiles.join(', ')}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 transition"
        >
          {copied ? (
            <><Check size={12} className="text-green-600" /><span className="text-green-600">Copied!</span></>
          ) : (
            <><Copy size={12} /><span>Copy</span></>
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <pre className="text-xs leading-5 font-mono">
          {lines.map((line, i) => {
            let bg = '';
            let textColor = 'text-gray-700 dark:text-gray-300';
            if (line.startsWith('+') && !line.startsWith('+++')) {
              bg = 'bg-green-50 dark:bg-green-900/20';
              textColor = 'text-green-800 dark:text-green-300';
            } else if (line.startsWith('-') && !line.startsWith('---')) {
              bg = 'bg-red-50 dark:bg-red-900/20';
              textColor = 'text-red-800 dark:text-red-300';
            } else if (line.startsWith('@@')) {
              bg = 'bg-blue-50 dark:bg-blue-900/20';
              textColor = 'text-blue-700 dark:text-blue-300';
            }

            return (
              <div key={i} className={`px-4 py-0.5 ${bg} ${textColor} min-w-0`}>
                <span className="text-gray-400 dark:text-gray-600 select-none inline-block w-8 text-right mr-3">
                  {i + 1}
                </span>
                {line}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
