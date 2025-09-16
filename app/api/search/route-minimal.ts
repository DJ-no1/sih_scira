// Minimal test route to isolate the issue
import { createUIMessageStream, JsonToSseTransformStream } from 'ai';
import { ChatMessage } from '@/lib/types';

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
  console.log('🔍 Minimal test endpoint hit');
  
  try {
    const { messages } = await req.json();
    console.log('🔍 Request parsed, creating simple stream...');
    
    // Simple stream that just returns a test message
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        console.log('🚀 Stream execution started');
        
        // Write a simple test message in the correct format
        writer.write({
          type: 'data-appendMessage',
          data: JSON.stringify({
            id: 'test-response',
            role: 'assistant',
            parts: [
              {
                type: 'text',
                text: 'Hello! This is a test response from the minimal API route.'
              }
            ]
          }),
          transient: false,
        });
        
        console.log('✅ Test message written');
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
    console.error('🔥 Minimal API Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred in minimal test.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}