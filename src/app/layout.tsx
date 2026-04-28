// src/app/layout.tsx
import type { Metadata } from 'next';
import { RootLayoutClient } from '@/components/RootLayoutClient';
import './globals.css';

export const metadata: Metadata = {
  title: 'IssueForge - AI-Powered GitHub Issue Triage',
  description:
    'Automatically triage, analyze, and resolve GitHub issues with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('issueforge-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
