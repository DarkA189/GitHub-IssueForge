// src/app/issue/[id]/page.tsx
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { IssueDetail } from '@/components/IssueDetail';
import { ExternalLink, ArrowLeft, CircleDot } from 'lucide-react';
import Link from 'next/link';

interface IssuePageProps {
  params: {
    id: string;
  };
}

export default async function IssuePage({ params }: IssuePageProps) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const issue = await prisma.issue.findUnique({
    where: { id: params.id },
    include: {
      repository: true,
      analysis: true,
    },
  });

  if (!issue) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-800 dark:text-red-300 font-semibold">Issue not found</p>
        <Link href="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition font-medium"
        >
          <ArrowLeft size={16} />
          <span>Back to dashboard</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
        <div className="px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">{issue.repository.fullName}</span>
                <span className="text-gray-400 dark:text-gray-500">·</span>
                <span>#{issue.githubIssueNumber}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {issue.title}
              </h1>
              <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-800">
                  <CircleDot size={12} />
                  <span>Open</span>
                </span>
                {issue.author && (
                  <span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{issue.author}</span> opened this issue
                  </span>
                )}
              </div>
            </div>

            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition"
            >
              <span>GitHub</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {issue.body && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Description</h3>
          </div>
          <div className="px-5 py-4">
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
              {issue.body}
            </p>
          </div>
        </div>
      )}

      <IssueDetail issueId={params.id} existingAnalysis={issue.analysis} />
    </div>
  );
}
