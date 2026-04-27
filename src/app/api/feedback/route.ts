// src/app/api/feedback/route.ts
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { issueId, analysisId, helpful, comment } = await req.json();

    const feedback = await prisma.feedback.upsert({
      where: {
        issueId_userId: {
          issueId,
          userId: session.user.id,
        },
      },
      update: {
        helpful,
        comment,
      },
      create: {
        userId: session.user.id,
        issueId,
        analysisId,
        helpful,
        comment,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}