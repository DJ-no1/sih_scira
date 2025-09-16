// Search API with AI streaming functionality
import { createUIMessageStream, JsonToSseTransformStream, streamText, convertToModelMessages } from 'ai';
import { scira } from '@/ai/providers';
import { ChatMessage } from '@/lib/types';
import { geolocation } from '@vercel/functions';
import {
  webSearchTool,
  greetingTool,
  datetimeTool,
  textTranslateTool,
} from '@/lib/tools';

export const maxDuration = 300; // 5 minutes

// Handle CORS preflight requests
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: Request) {
  console.log('🔍 Search API endpoint hit');

  try {
    console.log('🔍 Parsing request body...');
    const { messages, model } = await req.json();
    console.log('🔍 Request parsed - model:', model);

    const { latitude, longitude } = geolocation(req);
    console.log('🔍 Location extracted:', latitude, longitude);

    // Start streaming response with AI
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer: dataStream }) => {
        console.log('🚀 Starting AI stream processing...');

        const result = streamText({
          model: scira.languageModel(model || 'scira-default'),
          messages: convertToModelMessages(messages),
          system: 'You are a helpful AI assistant with access to web search, weather, and other tools. Use them when appropriate to provide accurate and up-to-date information.' + (latitude && longitude ? `\n\nUser location: ${latitude}, ${longitude}` : ''),
          tools: {
            greeting: greetingTool('UTC'),
            datetime: datetimeTool,
            text_translate: textTranslateTool,
            web_search: webSearchTool(dataStream), // May have limited functionality due to API keys
          },
          maxRetries: 2,
          abortSignal: AbortSignal.timeout(240000), // 4 minutes
          onChunk(event) {
            if (event.chunk.type === 'text-delta') {
              console.log('📝 Text chunk received');
            } else if (event.chunk.type === 'tool-call') {
              console.log('🔧 Tool called:', event.chunk.toolName);
            }
          },
          onFinish: async (event) => {
            console.log('✅ Stream finished:', event.finishReason);
          },
          onError(event) {
            console.error('❌ Stream error:', event.error);
          },
        });

        // Consume the stream and merge
        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true, // This enables reasoning display
            messageMetadata: ({ part }) => {
              if (part.type === 'finish') {
                return {
                  model: model as string,
                  completionTime: 0,
                  createdAt: new Date().toISOString(),
                  totalTokens: part.totalUsage?.totalTokens ?? null,
                  inputTokens: part.totalUsage?.inputTokens ?? null,
                  outputTokens: part.totalUsage?.outputTokens ?? null,
                };
              }
            },
          }),
        );
      },
      onError(error) {
        console.error('🔥 UI Stream Error:', error);
        return 'Sorry, an error occurred. Please try again.';
      },
    });

    console.log('🔍 Returning streaming response...');

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error) {
    console.error('🔥 API Error:', error);

    if (error instanceof Error && error.message.includes('timeout')) {
      return new Response(
        JSON.stringify({
          error: 'Request timeout',
          message: 'The request timed out. Please try again.'
        }),
        {
          status: 408,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}