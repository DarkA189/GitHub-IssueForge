// src/lib/llm.ts
import Groq from 'groq-sdk';

export type AnalysisResult = {
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  rootCause: string;
  reproductionSteps: string;
  suggestedFix: string;
  codeDiff: string;
  prDescription: string;
  affectedFiles: string[];
};

async function analyzeWithGroq(
  issueTitle: string,
  issueBody: string,
  codeContext: string
): Promise<AnalysisResult> {
  console.log('[Groq] Starting analysis for:', issueTitle.substring(0, 50));
  
  const apiKey = process.env.GROQ_API_KEY;
  console.log('[Groq] API Key exists:', !!apiKey);
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const client = new Groq({ apiKey });

  // Truncate issue body if too long to leave room for response
  const truncatedBody = (issueBody || 'No description provided').substring(0, 4000);
  const truncatedContext = (codeContext || 'No code context available').substring(0, 3000);

  const prompt = `Analyze this GitHub issue thoroughly. Provide detailed, specific analysis for EVERY field.

## Issue Title: ${issueTitle}

## Issue Description:
${truncatedBody}

## Repository Code Context:
${truncatedContext}

You MUST respond with a JSON object. Every field MUST have real, specific, detailed content.
DO NOT use placeholder text like "Unable to determine" or "Further investigation required".
Be specific to THIS issue.

{
  "severity": "medium",
  "confidence": 0.8,
  "rootCause": "A detailed 2-3 sentence explanation of why this issue exists and what causes it. Reference specific parts of the code or issue description.",
  "reproductionSteps": "1. Step one to reproduce the issue\\n2. Step two\\n3. Step three\\n4. What you expect vs what actually happens",
  "suggestedFix": "A detailed 2-3 sentence technical recommendation for how to fix this issue. Include specific function names, patterns, or approaches.",
  "codeDiff": "- old problematic code line\\n+ new fixed code line\\n- another old line\\n+ another fix",
  "prDescription": "## Fix: ${issueTitle}\\n\\n### Problem\\nBrief problem description\\n\\n### Solution\\n- What was changed and why\\n\\n### Testing\\n- How to verify the fix works",
  "affectedFiles": ["src/lib/example.ts"]
}

RULES:
- severity: exactly one of low, medium, high, critical
- confidence: number between 0.0 and 1.0
- rootCause: minimum 30 words, specific to this issue
- suggestedFix: minimum 30 words, actionable advice
- reproductionSteps: numbered list with at least 3 steps
- codeDiff: actual code changes with - and + prefixes
- prDescription: real markdown PR template
- affectedFiles: list of likely file paths`;

  try {
    console.log('[Groq] Calling API...');
    const message = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a senior software engineer performing code review. Respond with valid JSON only. No markdown fences. Every field must contain detailed, specific content — never use placeholder or generic text. Escape special characters properly in JSON strings. Use \\n for newlines within strings.'
        },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    console.log('[Groq] Response received, parsing...');
    const responseText = message.choices[0]?.message?.content || '';
    
    console.log('[Groq] Raw response length:', responseText.length);

    // Strip markdown code blocks if present
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      console.log('[Groq] First parse failed, attempting cleanup...');
      const cleaned = jsonText
        .replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
        .replace(/[\x00-\x1F\x7F]/g, ' ');
      parsed = JSON.parse(cleaned);
    }

    // Debug logging — see exactly what Groq returned
    console.log('[Groq] Parsed keys:', Object.keys(parsed));
    console.log('[Groq] severity:', parsed.severity);
    console.log('[Groq] confidence:', parsed.confidence);
    console.log('[Groq] rootCause preview:', String(parsed.rootCause || '').substring(0, 100));
    console.log('[Groq] suggestedFix preview:', String(parsed.suggestedFix || '').substring(0, 100));
    console.log('[Groq] reproductionSteps preview:', String(parsed.reproductionSteps || '').substring(0, 100));
    console.log('[Groq] codeDiff preview:', String(parsed.codeDiff || '').substring(0, 100));
    console.log('[Groq] prDescription preview:', String(parsed.prDescription || '').substring(0, 100));

    // Check if we got real content
    const hasRealContent = parsed.rootCause && 
      parsed.rootCause.length > 20 && 
      parsed.rootCause !== 'Unable to determine';
    
    console.log('[Groq] Has real content:', hasRealContent);
    console.log('[Groq] Analysis complete');

    return {
      severity: (['low', 'medium', 'high', 'critical'].includes(parsed.severity) 
        ? parsed.severity 
        : 'medium') as 'low' | 'medium' | 'high' | 'critical',
      confidence: Math.min(Math.max(Number(parsed.confidence) || 0.5, 0), 1),
      rootCause: parsed.rootCause || 'Analysis could not determine the root cause.',
      reproductionSteps: parsed.reproductionSteps || parsed.reproduction_steps || 'No reproduction steps generated.',
      suggestedFix: parsed.suggestedFix || parsed.suggested_fix || 'No fix suggestion generated.',
      codeDiff: parsed.codeDiff || parsed.code_diff || '',
      prDescription: parsed.prDescription || parsed.pr_description || '',
      affectedFiles: Array.isArray(parsed.affectedFiles || parsed.affected_files) 
        ? (parsed.affectedFiles || parsed.affected_files) 
        : [],
    };
  } catch (error) {
    console.error('[Groq] Error:', error);
    throw error;
  }
}

export async function analyzeIssue(
  issueTitle: string,
  issueBody: string,
  codeContext: string
): Promise<AnalysisResult> {
  console.log('[LLM] analyzeIssue called');
  try {
    const result = await analyzeWithGroq(issueTitle, issueBody, codeContext);
    console.log('[LLM] analyzeIssue success');
    return result;
  } catch (error) {
    console.error('[LLM] analyzeIssue failed:', error);
    throw error;
  }
}

export function generateBasicAnalysis(
  issueTitle: string,
  issueBody: string
): Partial<AnalysisResult> {
  console.log('[Fallback] Using basic analysis');

  const bodyLower = `${issueTitle} ${issueBody}`.toLowerCase();

  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  if (bodyLower.includes('crash') || bodyLower.includes('critical')) {
    severity = 'critical';
  } else if (bodyLower.includes('bug') || bodyLower.includes('error')) {
    severity = 'high';
  }

  return {
    severity,
    confidence: 0.3,
    rootCause: 'Automatic classification',
    reproductionSteps: 'See issue description',
    suggestedFix: 'Run AI analysis for suggestions',
  };
}