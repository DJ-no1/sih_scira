import { z } from 'zod';
import type {
  codeInterpreterTool,
  currencyConverterTool,
  retrieveTool,
  trendingMoviesTool,
  textTranslateTool,
  webSearchTool,
  weatherTool,
  findPlaceOnMapTool,
  nearbyPlacesSearchTool,
  flightTrackerTool,
  datetimeTool,
  mcpSearchTool,
  extremeSearchTool,
  greetingTool,
  movieTvSearchTool,
  trendingTvTool,
} from '@/lib/tools';

import type { InferUITool, UIMessage } from 'ai';

export type DataPart = { type: 'append-message'; message: string };
export type DataQueryCompletionPart = {
  type: 'data-query_completion';
  data: {
    query: string;
    index: number;
    total: number;
    status: 'started' | 'completed' | 'error';
    resultsCount: number;
    imagesCount: number;
  };
};

export type DataExtremeSearchPart = {
  type: 'data-extreme_search';
  data:
  | {
    kind: 'plan';
    status: { title: string };
    plan?: Array<{ title: string; todos: string[] }>;
  }
  | {
    kind: 'query';
    queryId: string;
    query: string;
    status: 'started' | 'reading_content' | 'completed' | 'error';
  }
  | {
    kind: 'source';
    queryId: string;
    source: { title: string; url: string; favicon?: string };
  }
  | {
    kind: 'content';
    queryId: string;
    content: { title: string; url: string; text: string; favicon?: string };
  }
  | {
    kind: 'code';
    codeId: string;
    title: string;
    code: string;
    status: 'running' | 'completed' | 'error';
    result?: string;
    charts?: any[];
  }
  | {
    kind: 'x_search';
    xSearchId: string;
    query: string;
    startDate: string;
    endDate: string;
    handles?: string[];
    status: 'started' | 'completed' | 'error';
    result?: {
      content: string;
      citations: any[];
      sources: Array<{ text: string; link: string; title?: string }>;
      dateRange: string;
      handles: string[];
    };
  };
};

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
  model: z.string(),
  completionTime: z.number().nullable(),
  inputTokens: z.number().nullable(),
  outputTokens: z.number().nullable(),
  totalTokens: z.number().nullable(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof weatherTool>;
type codeInterpreterTool = InferUITool<typeof codeInterpreterTool>;
type currencyConverterTool = InferUITool<typeof currencyConverterTool>;
type retrieveTool = InferUITool<typeof retrieveTool>;
type trendingMoviesTool = InferUITool<typeof trendingMoviesTool>;
type textTranslateTool = InferUITool<typeof textTranslateTool>;
type greetingTool = InferUITool<ReturnType<typeof greetingTool>>;
type flightTrackerTool = InferUITool<typeof flightTrackerTool>;
type findPlaceOnMapTool = InferUITool<typeof findPlaceOnMapTool>;
type nearbyPlacesSearchTool = InferUITool<typeof nearbyPlacesSearchTool>;
type webSearch = InferUITool<ReturnType<typeof webSearchTool>>;
type extremeSearch = InferUITool<ReturnType<typeof extremeSearchTool>>;
type movieTvSearchTool = InferUITool<typeof movieTvSearchTool>;
type trendingTvTool = InferUITool<typeof trendingTvTool>;
type datetimeTool = InferUITool<typeof datetimeTool>;
type mcpSearchTool = InferUITool<typeof mcpSearchTool>;

export type ChatTools = {
  currency_converter: currencyConverterTool;

  // Search & Content Tools
  web_search: webSearch;
  retrieve: retrieveTool;

  // Media & Entertainment
  movie_or_tv_search: movieTvSearchTool;
  trending_movies: trendingMoviesTool;
  trending_tv: trendingTvTool;

  // Location & Maps
  find_place_on_map: findPlaceOnMapTool;
  nearby_places_search: nearbyPlacesSearchTool;
  get_weather_data: weatherTool;

  // Utility Tools
  text_translate: textTranslateTool;
  code_interpreter: codeInterpreterTool;
  track_flight: flightTrackerTool;
  datetime: datetimeTool;
  mcp_search: mcpSearchTool;
  extreme_search: extremeSearch;
  greeting: greetingTool;
};

export type CustomUIDataTypes = {
  appendMessage: string;
  id: string;
  'message-annotations': any;
  query_completion: {
    query: string;
    index: number;
    total: number;
    status: 'started' | 'completed' | 'error';
    resultsCount: number;
    imagesCount: number;
  };
  extreme_search: DataExtremeSearchPart['data'];
};

export type ChatMessage = UIMessage<MessageMetadata, CustomUIDataTypes, ChatTools>;

export interface Attachment {
  name: string;
  url: string;
  contentType?: string;
  mediaType?: string;
}
