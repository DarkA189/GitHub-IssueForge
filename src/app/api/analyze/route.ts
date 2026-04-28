// src/app/api/analyze/route.ts
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeIssue, generateBasicAnalysis } from '@/lib/llm';
import { createOctokitInstance, getFileContent } from '@/lib/github';
import { checkRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('[Analyze Route] Request received');

  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Analyze Route] Session:', !!session?.user?.id);

    const rateLimitOk = await checkRateLimit(session.user.id);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in 1 hour.' },
        { status: 429 }
      );
    }

    const { issueId, forceReanalyze = false, includeCodeContext = true } = await req.json();

    console.log('[Analyze Route] Issue:', issueId, 'Force:', forceReanalyze);

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { repository: true, analysis: true },
    });

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // Only return cached analysis if NOT forcing re-analyze
    if (!forceReanalyze && issue.analysis && issue.analysis.status === 'completed') {
      console.log('[Analyze Route] Returning cached analysis');
      return NextResponse.json(issue.analysis);
    }

    // If forcing re-analyze, delete old analysis first
    if (forceReanalyze && issue.analysis) {
      console.log('[Analyze Route] Deleting old analysis for re-analyze');
      await prisma.analysis.delete({
        where: { id: issue.analysis.id },
      });
    }

    // Create new analysis record
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        issueId,
        status: 'analyzing',
      },
    });

    const startTime = Date.now();

    let codeContext = '';

    if (includeCodeContext) {
      try {
        const account = await prisma.account.findFirst({
          where: {
            userId: session.user.id,
            provider: 'github',
          },
        });

        if (account?.access_token) {
          const octokit = await createOctokitInstance(account.access_token);

          const commonPaths = [
            'src/index.ts',
            'src/main.ts',
            'src/app.ts',
            'index.ts',
            'main.ts',
            'app.ts',
            'package.json',
            'README.md',
          ];

          for (const path of commonPaths) {
            const content = await getFileContent(
              octokit,
              issue.repository.owner,
              issue.repository.name,
              path
            );
            if (content) {
              codeContext += `\n\n=== ${path} ===\n${content.substring(0, 2000)}`;
              if (codeContext.length > 8000) break;
            }
          }
        }
      } catch (error) {
        console.warn('[Analyze Route] Could not fetch code context:', error);
      }
    }

    let analysisResult;
    let usedFallback = false;

    try {
      console.log('[Analyze Route] Calling analyzeIssue...');
      analysisResult = await analyzeIssue(
        issue.title,
        issue.body || '',
        codeContext
      );
      console.log('[Analyze Route] analyzeIssue succeeded');
    } catch (error) {
      console.error('[Analyze Route] LLM analysis failed:', error);
      console.error('[Analyze Route] Provider:', process.env.LLM_PROVIDER);
      console.error('[Analyze Route] GROQ key exists:', !!process.env.GROQ_API_KEY);
      analysisResult = generateBasicAnalysis(issue.title, issue.body || '');
      usedFallback = true;
    }

    const analysisTime = Date.now() - startTime;

    const updatedAnalysis = await prisma.analysis.update({
      where: { id: analysis.id },
      data: {
        severity: analysisResult.severity || 'medium',
        confidence: analysisResult.confidence || 0,
        rootCause: analysisResult.rootCause,
        reproductionSteps: analysisResult.reproductionSteps,
        suggestedFix: analysisResult.suggestedFix,
        codeDiff: analysisResult.codeDiff,
        prDescription: analysisResult.prDescription,
        affectedFiles: analysisResult.affectedFiles || [],
        llmModel: usedFallback ? 'fallback' : (process.env.LLM_PROVIDER || 'groq'),
        analysisTime,
        status: 'completed',
        errorMessage: usedFallback ? 'LLM failed, used basic analysis' : null,
      },
    });

    console.log('[Analyze Route] Analysis saved, model:', usedFallback ? 'fallback' : 'groq');

    return NextResponse.json(updatedAnalysis);
  } catch (error) {
    console.error('[Analyze Route] Error:', error);

    return NextResponse.json(
      { error: 'Failed to analyze issue' },
      { status: 500 }
    );
  }
}
