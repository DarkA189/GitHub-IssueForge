// src/app/api/analyze/route.ts
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeIssue, generateBasicAnalysis } from '@/lib/llm';
import { createOctokitInstance, getFileContent } from '@/lib/github';
import { checkRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  
  try {
    const session = await getServerSession(authConfig);
    console.log('[Analyze Route] Session:', !!session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rateLimitOk = await checkRateLimit(session.user.id);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in 1 hour.' },
        { status: 429 }
      );
    }

    const { issueId, includeCodeContext = true } = await req.json();

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

    // Check if analysis already exists
    if (issue.analysis && issue.analysis.status === 'completed') {
      return NextResponse.json(issue.analysis);
    }

    // Create or update analysis record
    let analysis = await prisma.analysis.findUnique({
      where: { issueId },
    });

    if (!analysis) {
      analysis = await prisma.analysis.create({
        data: {
          userId: session.user.id,
          issueId,
          status: 'analyzing',
        },
      });
    } else {
      analysis = await prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: 'analyzing' },
      });
    }

    const startTime = Date.now();

    let codeContext = '';

    if (includeCodeContext) {
      try {
        // Get GitHub token
        const account = await prisma.account.findFirst({
          where: {
            userId: session.user.id,
            provider: 'github',
          },
        });

        if (account?.access_token) {
          const octokit = await createOctokitInstance(account.access_token);

          // Search for relevant code files
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
        console.warn('Could not fetch code context:', error);
      }
    }

    let analysisResult;

    try {
      analysisResult = await analyzeIssue(
        issue.title,
        issue.body || '',
        codeContext
      );
    } catch (error) {
      console.error('LLM analysis failed:', error);
      console.error('Provider:', process.env.LLM_PROVIDER);
      console.error('API Key exists:', !!process.env.GROK_API_KEY || !!process.env.ANTHROPIC_API_KEY || !!process.env.OPENAI_API_KEY);
      analysisResult = generateBasicAnalysis(issue.title, issue.body || '');
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
        llmModel: process.env.LLM_PROVIDER,
        analysisTime,
        status: 'completed',
      },
    });

    return NextResponse.json(updatedAnalysis);
  } catch (error) {
    console.error('Error analyzing issue:', error);

    return NextResponse.json(
      { error: 'Failed to analyze issue' },
      { status: 500 }
    );
  }
}