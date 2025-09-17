// /app/api/search/route.ts
import {
  convertToModelMessages,
  streamText,
  createUIMessageStream,
  JsonToSseTransformStream,
} from 'ai';
import { scira } from '@/ai/providers';
import { geolocation } from '@vercel/functions';
import {
  currencyConverterTool,
  textTranslateTool,
  webSearchTool,
  movieTvSearchTool,
  trendingMoviesTool,
  trendingTvTool,
  retrieveTool,
  weatherTool,
  codeInterpreterTool,
  findPlaceOnMapTool,
  nearbyPlacesSearchTool,
  flightTrackerTool,
  datetimeTool,
  greetingTool,
  mcpSearchTool,
  extremeSearchTool,
} from '@/lib/tools';
import { markdownJoinerTransform } from '@/lib/parser';
import { ChatMessage } from '@/lib/types';

export const maxDuration = 300; // 5 minutes

// Simple stub for stream context since we removed resumable streaming
export function getStreamContext() {
  return null;
}

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
    const { messages, model = 'scira-default', group = 'web', searchProvider = 'parallel', timezone = 'UTC' } = await req.json();
    const { latitude, longitude } = geolocation(req);

    console.log('Running with model:', model);
    console.log('Group:', group);
    console.log('Location:', latitude, longitude);

    // Start streaming response with AI
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer: dataStream }) => {
        console.log('🚀 Starting AI stream processing...');

        const result = streamText({
          model: scira.languageModel(model),
          messages: convertToModelMessages(messages),
          system: `You are SCIRA, an advanced AI research assistant designed to provide comprehensive analysis based on search results.

## CRITICAL WORKFLOW:
1. When user asks a question, IMMEDIATELY run the appropriate search tool
2. After getting search results, ALWAYS provide detailed written analysis
3. NEVER just return raw links or basic summaries

## MANDATORY BEHAVIOR AFTER TOOL EXECUTION:
- Write a comprehensive response analyzing the search results
- Use markdown formatting with headers and sections
- Include specific details and insights from the search data
- Provide citations and sources
- Give actionable conclusions or recommendations

## EXAMPLE FLOW:
User: "What are the current affairs of India?"
Assistant: [runs web_search tool]
Assistant: "Based on my comprehensive search of current Indian affairs, here's what's happening:

# Current Affairs in India - ${new Date().toLocaleDateString()}

## Major Political Developments
[Detailed analysis of political news from search results]

## Economic Updates  
[Analysis of economic developments]

## Social and Cultural News
[Coverage of social issues and cultural events]

## Key Takeaways
- [Specific insight 1]
- [Specific insight 2]
- [Specific insight 3]

## Sources
[List of sources with proper citations]"

## TOOLS GUIDELINES:
- For web searches: Use multiple targeted queries (3-5) for comprehensive coverage
- Always specify recent timeframes when searching for current affairs
- Use appropriate search providers based on content type
- Include relevant location context when available

Today's Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}`
            + (latitude && longitude ? `\nUser Location: ${latitude}, ${longitude}` : ''),
          tools: {
            // Search & Content Tools
            web_search: webSearchTool(dataStream, searchProvider),
            retrieve: retrieveTool,

            // Media & Entertainment
            movie_or_tv_search: movieTvSearchTool,
            trending_movies: trendingMoviesTool,
            trending_tv: trendingTvTool,

            // Location & Maps
            find_place_on_map: findPlaceOnMapTool,
            nearby_places_search: nearbyPlacesSearchTool,
            get_weather_data: weatherTool,

            // Utility Tools
            text_translate: textTranslateTool,
            code_interpreter: codeInterpreterTool,
            track_flight: flightTrackerTool,
            datetime: datetimeTool,
            mcp_search: mcpSearchTool,
            extreme_search: extremeSearchTool(dataStream),
            currency_converter: currencyConverterTool,
            greeting: greetingTool(timezone),
          },
          toolChoice: 'auto',
          maxRetries: 3,
          experimental_transform: markdownJoinerTransform(),
          onChunk(event) {
            if (event.chunk.type === 'tool-call') {
              console.log('🔧 Tool called:', event.chunk.toolName);
            }
          },
          onFinish(event) {
            console.log('✅ Stream finished:', event.finishReason);
            console.log('Steps taken:', event.steps?.length || 0);
          },
          onError(event) {
            console.error('❌ Stream error:', event.error);
          },
        });

        // Consume the stream and merge
        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
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
        return 'Sorry, an error occurred during search. Please try again.';
      },
    });

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