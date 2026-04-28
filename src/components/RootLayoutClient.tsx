// src/components/RootLayoutClient.tsx
'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Navbar } from './Navbar';
import { ErrorBoundary } from './ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    </SessionProvider>
  );
}
