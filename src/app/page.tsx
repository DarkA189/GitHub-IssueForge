// src/app/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import Link from 'next/link';
import { ArrowRight, Zap, Brain, GitMerge } from 'lucide-react';

export default async function Home() {
  const session = await getServerSession(authConfig);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-3xl">
          <div className="mb-6 flex justify-center">
            <div className="text-6xl">⚡</div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            IssueForge
          </h1>

          <p className="text-xl text-gray-600 mb-2">
            AI-Powered GitHub Issue Triage & Auto-Resolver
          </p>

          <p className="text-lg text-gray-500 mb-8">
            Transform chaotic bug backlogs into fast, reliable resolutions with AI-powered analysis and human-in-the-loop review.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-semibold text-lg"
          >
            <span>Get Started with GitHub</span>
            <ArrowRight size={20} />
          </Link>

          {/* Features Preview */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <Zap className="text-blue-600 mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">
                Instant Triage
              </h3>
              <p className="text-gray-600 text-sm">
                Automatically categorize and prioritize issues by severity
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <Brain className="text-purple-600 mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">
                AI Analysis
              </h3>
              <p className="text-gray-600 text-sm">
                Get root cause analysis and suggested fixes powered by Claude
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <GitMerge className="text-green-600 mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">
                Ready-to-Submit PRs
              </h3>
              <p className="text-gray-600 text-sm">
                Generate PR descriptions and code diffs with one click
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-gray-600">
        <p>Built with Next.js, Prisma, and Claude AI</p>
      </footer>
    </div>
  );
}