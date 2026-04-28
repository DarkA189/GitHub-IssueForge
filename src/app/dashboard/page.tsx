// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { IssueDashboard } from '@/components/IssueDashboard';

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <IssueDashboard />
    </div>
  );
}
