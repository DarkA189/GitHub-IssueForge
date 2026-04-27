// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { RootLayoutClient } from '@/components/RootLayoutClient';

export const metadata: Metadata = {
  title: 'IssueForge - AI-Powered GitHub Issue Triage',
  description:
    'Automatically triage, analyze, and resolve GitHub issues with AI',
  icons: {
    icon: '⚡',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}