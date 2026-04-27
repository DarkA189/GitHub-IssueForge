// src/app/api/github/repos/route.ts
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createOctokitInstance,
  getUserRepositories,
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

    // Get GitHub token from account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github',
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: 'GitHub token not found' },
        { status: 400 }
      );
    }

    const octokit = await createOctokitInstance(account.access_token);
    const repos = await getUserRepositories(octokit);

    return NextResponse.json(repos);
  } catch (error) {
    console.error('Error fetching repos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { owner, name, fullName, description, url } = await req.json();

    const repository = await prisma.repository.upsert({
      where: { fullName },
      update: { description, updatedAt: new Date() },
      create: {
        userId: session.user.id,
        owner,
        name,
        fullName,
        description,
        url,
      },
    });

    return NextResponse.json(repository);
  } catch (error) {
    console.error('Error creating repository:', error);
    return NextResponse.json(
      { error: 'Failed to save repository' },
      { status: 500 }
    );
  }
}