// src/app/api/analytics/route.ts
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    const [
      totalAnalyses,
      completedAnalyses,
      avgConfidence,
      severityBreakdown,
      feedbackStats,
      topRepositories,
    ] = await Promise.all([
      prisma.analysis.count({
        where: { userId: session.user.id },
      }),
      prisma.analysis.count({
        where: {
          userId: session.user.id,
          status: 'completed',
        },
      }),
      prisma.analysis.aggregate({
        where: {
          userId: session.user.id,
          status: 'completed',
        },
        _avg: { confidence: true },
      }),
      prisma.analysis.groupBy({
        by: ['severity'],
        where: { userId: session.user.id },
        _count: true,
      }),
      prisma.feedback.groupBy({
        by: ['helpful'],
        where: {
          userId: session.user.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        _count: true,
      }),
      prisma.repository.findMany({
        where: { userId: session.user.id },
        include: {
          issues: {
            include: {
              analysis: true,
            },
          },
        },
        take: 5,
      }),
    ]);

    const severityMap = Object.fromEntries(
      severityBreakdown.map((item: any) => [
        item.severity,
        item._count,
      ])
    );

    const helpful = feedbackStats.find((f: any) => f.helpful === true)?._count || 0;
    const unhelpful = feedbackStats.find((f: any) => f.helpful === false)?._count || 0;

    return NextResponse.json({
      totalAnalyses,
      completedAnalyses,
      successRate:
        totalAnalyses > 0 ? ((completedAnalyses / totalAnalyses) * 100).toFixed(1) : 0,
      avgConfidence: (avgConfidence._avg.confidence || 0).toFixed(2),
      severityBreakdown: severityMap,
      helpfulFeedback:
        helpful + unhelpful > 0
          ? ((helpful / (helpful + unhelpful)) * 100).toFixed(1)
          : 0,
      topRepositories: topRepositories.map((repo: any) => ({
        name: repo.fullName,
        issueCount: repo.issues.length,
        analysisCount: repo.issues.filter((i: any) => i.analysis).length,
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}