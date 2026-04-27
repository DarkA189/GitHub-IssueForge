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

  const prompt = `You are an expert software engineer. Analyze this GitHub issue and respond ONLY with valid JSON.

Issue Title: ${issueTitle}

Issue Description:
${issueBody || 'No description'}

Code Context:
${codeContext || 'No context'}

JSON format:
{
  "severity": "low|medium|high|critical",
  "confidence": 0.5,
  "rootCause": "Explanation",
  "reproductionSteps": "Steps",
  "suggestedFix": "How to fix",
  "codeDiff": "Code changes",
  "prDescription": "PR description",
  "affectedFiles": ["file1.ts"]
}`;

  try {
    console.log('[Groq] Calling API...');
    const message = await client.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert software engineer. Always respond with valid JSON only. No markdown, no code blocks, no extra text. Escape all special characters properly in JSON strings.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    console.log('[Groq] Response received, parsing...');
    const responseText = message.choices[0]?.message?.content || '';
    
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
      // Fix common JSON issues: bad escape chars
      console.log('[Groq] First parse failed, attempting cleanup...');
      const cleaned = jsonText
        .replace(/\\(?!["\\/bfnrtu])/g, '\\\\')  // fix bad escapes
        .replace(/[\x00-\x1F\x7F]/g, ' ');        // remove control chars
      parsed = JSON.parse(cleaned);
    }
    
    console.log('[Groq] Analysis complete');
    return {
      severity: (parsed.severity || 'medium') as 'low' | 'medium' | 'high' | 'critical',
      confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
      rootCause: parsed.rootCause || 'Unable to determine',
      reproductionSteps: parsed.reproductionSteps || 'See issue',
      suggestedFix: parsed.suggestedFix || 'Further investigation required',
      codeDiff: parsed.codeDiff || 'No changes',
      prDescription: parsed.prDescription || 'Not generated',
      affectedFiles: Array.isArray(parsed.affectedFiles) ? parsed.affectedFiles : [],
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