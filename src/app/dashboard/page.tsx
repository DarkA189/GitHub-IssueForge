// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { IssueDashboard } from '@/components/IssueDashboard';

export default async function DashboardPage() {
  const session = await getServerSession(authConfig)

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Issue Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        Connect a repository and start analyzing issues with AI
      </p>

      <IssueDashboard />
    </div>
  );
}