import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Request schema validation
const AiRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  agent: z.enum(['claude-sonnet-4.5', 'claude-sonnet-4', 'claude-haiku-4.5', 'grok-fast']),
});

// Agent-specific configurations
const AGENT_CONFIGS = {
  'claude-sonnet-4.5': {
    systemInstruction: 'You are Claude Sonnet 4.5, an advanced AI assistant with exceptional reasoning and creative capabilities.',
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
  },
  'claude-sonnet-4': {
    systemInstruction: 'You are Claude Sonnet 4, a highly capable AI assistant with strong analytical skills.',
    temperature: 0.6,
    topP: 0.9,
    topK: 32,
  },
  'claude-haiku-4.5': {
    systemInstruction: 'You are Claude Haiku 4.5, a concise and creative AI assistant that provides clear, focused responses.',
    temperature: 0.8,
    topP: 0.92,
    topK: 32,
  },
  'grok-fast': {
    systemInstruction: 'You are Grok Fast, a rapid-response AI assistant optimized for quick, accurate, and insightful answers.',
    temperature: 0.5,
    topP: 0.85,
    topK: 20,
  },
};

// Error response utility
function createErrorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      error: message,
      status,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Rate limiting check (simple implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const current = rateLimitMap.get(ip);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.ip ||
               request.headers.get('x-forwarded-for')?.split(',')[0] ||
               'unknown';

    // Check rate limiting
    if (!checkRateLimit(ip)) {
      return createErrorResponse(
        'Rate limit exceeded. Please try again later.',
        429
      );
    }

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return createErrorResponse(
        'API configuration error. Please contact support.',
        500
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = AiRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        `Invalid request: ${validationResult.error.issues.map(i => i.message).join(', ')}`,
        400
      );
    }

    const { prompt, agent } = validationResult.data;
    const agentConfig = AGENT_CONFIGS[agent];

    // Initialize Gemini with API key
    const genAI = new GoogleGenerativeAI(apiKey);

    // Configure the model with agent-specific settings
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: agentConfig.systemInstruction,
    });

    // Generation configuration
    const generationConfig = {
      temperature: agentConfig.temperature,
      topP: agentConfig.topP,
      topK: agentConfig.topK,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain',
    };

    // Start generation
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    const text = response.text();

    if (!text) {
      return createErrorResponse(
        'No response generated. Please try rephrasing your request.',
        500
      );
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      response: text,
      agent,
      timestamp: new Date().toISOString(),
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
      },
    });

  } catch (error: any) {
    console.error('AI API Error:', error);

    // Handle specific error types
    if (error.status === 401) {
      return createErrorResponse(
        'Authentication failed. Please check the API configuration.',
        401
      );
    }

    if (error.status === 403) {
      return createErrorResponse(
        'Access forbidden. The service may be temporarily unavailable.',
        403
      );
    }

    if (error.status === 429) {
      return createErrorResponse(
        'Service rate limit exceeded. Please try again in a moment.',
        429
      );
    }

    if (error.status >= 500) {
      return createErrorResponse(
        'AI service temporarily unavailable. Please try again later.',
        503
      );
    }

    // Generic error
    return createErrorResponse(
      'An unexpected error occurred. Please try again.',
      500
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return createErrorResponse('Method not allowed', 405);
}

export async function PUT() {
  return createErrorResponse('Method not allowed', 405);
}

export async function DELETE() {
  return createErrorResponse('Method not allowed', 405);
}