// src/app/issue/[id]/page.tsx
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { IssueDetail } from '@/components/IssueDetail';
import { ExternalLink } from 'lucide-react';

interface IssuePageProps {
  params: {
    id: string;
  };
}

export default async function IssuePage({ params }: IssuePageProps) {
  const session = await getServerSession(authConfig)

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
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold">Issue not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <span>{issue.repository.fullName}</span>
            <span>#{issue.githubIssueNumber}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {issue.title}
          </h1>
          <p className="text-gray-600 mt-2">
            by <span className="font-medium">{issue.author}</span>
          </p>
        </div>

        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
        >
          <span>View on GitHub</span>
          <ExternalLink size={16} />
        </a>
      </div>

      {issue.body && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Issue Description</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {issue.body}
            </p>
          </div>
        </div>
      )}

      <IssueDetail issueId={params.id} />
    </div>
  );
}