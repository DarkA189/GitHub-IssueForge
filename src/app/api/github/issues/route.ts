// src/app/api/github/issues/route.ts
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createOctokitInstance,
  getRepositoryIssues,
} from '@/lib/github';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get('repoId');

    if (!repoId) {
      return NextResponse.json(
        { error: 'Repository ID required' },
        { status: 400 }
      );
    }

    const repo = await prisma.repository.findUnique({
      where: { id: repoId },
    });

    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Get GitHub token from session
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github',
      },
    });

    const token = account?.access_token || process.env.GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token not found' },
        { status: 400 }
      );
    }

    const octokit = await createOctokitInstance(token);

    const githubIssues = await getRepositoryIssues(
      octokit,
      repo.owner,
      repo.name
    );

    // Save issues to database
    for (const issue of githubIssues) {
      await prisma.issue.upsert({
        where: {
          repositoryId_githubIssueNumber: {
            repositoryId: repo.id,
            githubIssueNumber: issue.number,
          },
        },
        update: {
          title: issue.title,
          body: issue.body,
          state: issue.state,
          updatedAtGithub: issue.updated_at ? new Date(issue.updated_at) : null,
        },
        create: {
          userId: session.user.id,
          repositoryId: repo.id,
          githubIssueNumber: issue.number,
          title: issue.title,
          body: issue.body,
          author: issue.user?.login,
          state: issue.state,
          url: issue.html_url,
          createdAtGithub: issue.created_at ? new Date(issue.created_at) : null,
          updatedAtGithub: issue.updated_at ? new Date(issue.updated_at) : null,
        },
      });
    }

    // Get issues with analysis from database
    const issues = await prisma.issue.findMany({
      where: {
        repositoryId: repo.id,
        state: 'open',
      },
      include: {
        analysis: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}