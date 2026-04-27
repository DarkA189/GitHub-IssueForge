// src/components/DiffViewer.tsx
'use client';

import React from 'react';
import { Copy, Check } from 'lucide-react';

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

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">Code Diff</h4>
          {affectedFiles && affectedFiles.length > 0 && (
            <p className="text-sm text-gray-600">
              {affectedFiles.join(', ')}
            </p>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition"
        >
          {copied ? (
            <>
              <Check size={16} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 text-sm text-gray-800 overflow-x-auto font-mono">
        <code>{codeDiff}</code>
      </pre>
    </div>
  );
}