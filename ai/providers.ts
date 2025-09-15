import { wrapLanguageModel, customProvider, extractReasoningMiddleware, simulateStreamingMiddleware } from 'ai';
import { httpAgent, httpsAgent } from '@/lib/socket-config';

import { openai, createOpenAI } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { groq } from '@ai-sdk/groq';
import { anthropic } from '@ai-sdk/anthropic';
import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';

const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  // Note: Google provider doesn't support timeout in constructor
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      signal: AbortSignal.timeout(380000), // 6.3 minutes timeout for Google requests
      // @ts-ignore - Node.js fetch may not support agent in all environments
      agent: url.toString().startsWith('https:') ? httpsAgent : httpAgent,
    });
  },
});

const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

const simmiddleware = simulateStreamingMiddleware();

const huggingface = createOpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: process.env.HF_TOKEN,
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      signal: AbortSignal.timeout(380000), // 6.3 minutes timeout for HuggingFace requests
      // @ts-ignore - Node.js fetch may not support agent in all environments
      agent: url.toString().startsWith('https:') ? httpsAgent : httpAgent,
    });
  },
});

export const scira = customProvider({
  languageModels: {
    'scira-default': googleProvider('gemini-2.5-flash'), // Changed to free Gemini model
    'scira-nano': groq('llama-3.3-70b-versatile'),
    'scira-name': huggingface.chat('meta-llama/Llama-3.3-70B-Instruct:cerebras'),
    'scira-grok-3': xai('grok-3-fast'),
    'scira-grok-4': xai('grok-4'),
    'scira-code': xai('grok-code-fast-1'),
    'scira-enhance': groq('moonshotai/kimi-k2-instruct'),
    'scira-gpt-oss-20': wrapLanguageModel({
      model: groq('openai/gpt-oss-20b'),
      middleware,
    }),
    'scira-5-nano': openai.responses('gpt-5-nano'),
    'scira-5-mini': openai.responses('gpt-5-mini'),
    'scira-5': openai.responses('gpt-5'),
    'scira-5-high': openai.responses('gpt-5'),
    'scira-qwen-32b': wrapLanguageModel({
      model: groq('qwen/qwen3-32b'),
      middleware,
    }),
    'scira-deepseek-v3': wrapLanguageModel({
      model: huggingface.chat('deepseek-ai/DeepSeek-V3.1:fireworks-ai'),
      middleware,
    }),
    'scira-qwen-coder': huggingface.chat('Qwen/Qwen3-Coder-480B-A35B-Instruct:cerebras'),
    'scira-qwen-30': huggingface.chat('Qwen/Qwen3-30B-A3B-Instruct-2507:nebius'),
    'scira-qwen-30-think': wrapLanguageModel({
      model: huggingface.chat('Qwen/Qwen3-30B-A3B-Thinking-2507:nebius'),
      middleware,
    }),
    'scira-qwen-235': huggingface.chat('Qwen/Qwen3-235B-A22B-Instruct-2507:together'),
    'scira-qwen-235-think': wrapLanguageModel({
      model: huggingface.chat('Qwen/Qwen3-235B-A22B-Thinking-2507:novita'),
      middleware: [middleware],
    }),
    'scira-glm-air': huggingface.chat('zai-org/GLM-4.5-Air:fireworks-ai'),
    'scira-glm': wrapLanguageModel({
      model: huggingface.chat('zai-org/GLM-4.5:fireworks-ai'),
      middleware,
    }),
    'scira-kimi-k2': groq('moonshotai/kimi-k2-instruct'),
    'scira-haiku': anthropic('claude-3-5-haiku-20241022'),
    'scira-mistral-medium': mistral('mistral-medium-2508'),
    'scira-google': googleProvider('gemini-2.5-flash'),
    'scira-google-pro': googleProvider('gemini-2.5-pro'),
    'scira-google-flash-lite': googleProvider('gemini-2.5-flash-lite'),
    'scira-google-flash-exp': googleProvider('gemini-2.5-flash-exp'),
    'scira-google-thinking': googleProvider('gemini-2.0-flash-thinking-exp'),
    'scira-google-flash-8b': googleProvider('gemini-1.5-flash-8b'),
    'scira-anthropic': anthropic('claude-sonnet-4-20250514'),
    'scira-llama-4': groq('meta-llama/llama-4-maverick-17b-128e-instruct'),
  },
});

interface Model {
  value: string;
  label: string;
  description: string;
  vision: boolean;
  reasoning: boolean;
  experimental: boolean;
  category: string;
  pdf: boolean;
  pro: boolean;
  requiresAuth: boolean;
  freeUnlimited: boolean;
  maxOutputTokens: number;
}

export const models: Model[] = [
  // Models (Default - Free Gemini)
  {
    value: 'scira-default',
    label: 'Gemini 2.5 Flash',
    description: "Google's advanced free LLM with vision support",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Free',
    pdf: true,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 10000,
  },
  {
    value: 'scira-grok-3',
    label: 'Grok 3',
    description: "xAI's recent smartest LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },
  {
    value: 'scira-grok-4',
    label: 'Grok 4',
    description: "xAI's most intelligent vision LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },
  {
    value: 'scira-code',
    label: 'Grok Code',
    description: "xAI's advanced coding LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },

  {
    value: 'scira-qwen-32b',
    label: 'Qwen 3 32B',
    description: "Alibaba's advanced reasoning LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Free',
    pdf: false,
    pro: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 40960,
  },
  {
    value: 'scira-5-nano',
    label: 'GPT 5 Nano',
    description: "OpenAI's latest flagship nano LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Free',
    pdf: true,
    pro: false,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 128000,
  },
  {
    value: 'scira-5-mini',
    label: 'GPT 5 Mini',
    description: "OpenAI's latest flagship mini LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 128000,
  },
  {
    value: 'scira-gpt-oss-20',
    label: 'OpenAI GPT OSS 20b',
    description: "OpenAI's advanced small OSS LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 8000,
  },
  {
    value: 'scira-kimi-k2',
    label: 'Kimi K2',
    description: "MoonShot AI's advanced base LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 10000,
  },
  {
    value: 'scira-deepseek-v3',
    label: 'DeepSeek V3.1',
    description: "DeepSeek's advanced base LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },
  {
    value: 'scira-qwen-coder',
    label: 'Qwen 3 Coder 480B-A35B',
    description: "Alibaba's advanced coding LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 130000,
  },
  {
    value: 'scira-qwen-30',
    label: 'Qwen 3 30B A3B Instruct',
    description: "Qwen's advanced instruct LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 100000,
  },
  {
    value: 'scira-qwen-30-think',
    label: 'Qwen 3 30B A3B Thinking',
    description: "Qwen's advanced thinking LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 100000,
  },
  {
    value: 'scira-qwen-235',
    label: 'Qwen 3 235B A22B',
    description: "Qwen's advanced instruct LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 100000,
  },
  {
    value: 'scira-qwen-235-think',
    label: 'Qwen 3 235B A22B Thinking',
    description: "Qwen's advanced thinking LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 100000,
  },
  {
    value: 'scira-glm-air',
    label: 'GLM 4.5 Air',
    description: "Zhipu AI's efficient base LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 130000,
  },
  {
    value: 'scira-glm',
    label: 'GLM 4.5',
    description: "Zhipu AI's advanced base LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 13000,
  },
  {
    value: 'scira-5',
    label: 'GPT 5',
    description: "OpenAI's latest flagship LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 128000,
  },
  {
    value: 'scira-5-high',
    label: 'GPT 5 (Max)',
    description: "OpenAI's latest flagship reasoning LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 128000,
  },
  {
    value: 'scira-anthropic',
    label: 'Claude 4 Sonnet',
    description: "Anthropic's most advanced LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 8000,
  },
  {
    value: 'scira-mistral-medium',
    label: 'Mistral Medium',
    description: "Mistral's medium LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 8000,
  },
  {
    value: 'scira-google',
    label: 'Gemini 2.5 Flash',
    description: "Google's advanced small LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Free',
    pdf: true,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 10000,
  },
  {
    value: 'scira-google-pro',
    label: 'Gemini 2.5 Pro',
    description: "Google's most advanced LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Free',
    pdf: true,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 10000,
  },
  {
    value: 'scira-google-flash-lite',
    label: 'Gemini 2.5 Flash-Lite',
    description: "Google's most cost-efficient model optimized for high throughput and low latency",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Free',
    pdf: true,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 8000,
  },
  {
    value: 'scira-google-flash-exp',
    label: 'Gemini 2.5 Flash Experimental',
    description: "Google's experimental flash model with latest features",
    vision: true,
    reasoning: false,
    experimental: true,
    category: 'Free',
    pdf: true,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 10000,
  },
  {
    value: 'scira-google-thinking',
    label: 'Gemini 2.0 Flash Thinking',
    description: "Google's reasoning-capable flash model",
    vision: true,
    reasoning: true,
    experimental: true,
    category: 'Free',
    pdf: true,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 10000,
  },
  {
    value: 'scira-google-flash-8b',
    label: 'Gemini 1.5 Flash 8B',
    description: "Google's efficient small model",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Free',
    pdf: true,
    pro: false,
    requiresAuth: false,
    freeUnlimited: true,
    maxOutputTokens: 8000,
  },

  // Experimental Models
  {
    value: 'scira-llama-4',
    label: 'Llama 4 Maverick',
    description: "Meta's latest LLM",
    vision: true,
    reasoning: false,
    experimental: true,
    category: 'Experimental',
    pdf: false,
    pro: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 8000,
  },
];

// Helper functions for model access checks
export function getModelConfig(modelValue: string) {
  return models.find((model) => model.value === modelValue);
}

export function requiresAuthentication(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.requiresAuth || false;
}

export function requiresProSubscription(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.pro || false;
}

export function isFreeUnlimited(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.freeUnlimited || false;
}

export function hasVisionSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.vision || false;
}

export function hasPdfSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.pdf || false;
}

export function hasReasoningSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.reasoning || false;
}

export function isExperimentalModel(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.experimental || false;
}

export function getMaxOutputTokens(modelValue: string): number {
  const model = getModelConfig(modelValue);
  return model?.maxOutputTokens || 8000;
}

// Access control helper
export function canUseModel(modelValue: string, user: any, isProUser: boolean): { canUse: boolean; reason?: string } {
  const model = getModelConfig(modelValue);

  if (!model) {
    return { canUse: false, reason: 'Model not found' };
  }

  // Check if model requires authentication
  if (model.requiresAuth && !user) {
    return { canUse: false, reason: 'authentication_required' };
  }

  // Check if model requires Pro subscription
  if (model.pro && !isProUser) {
    return { canUse: false, reason: 'pro_subscription_required' };
  }

  return { canUse: true };
}

// Helper to check if user should bypass rate limits
export function shouldBypassRateLimits(modelValue: string, user: any): boolean {
  const model = getModelConfig(modelValue);
  return Boolean(user && model?.freeUnlimited);
}

// Get acceptable file types for a model
export function getAcceptedFileTypes(modelValue: string, isProUser: boolean): string {
  const model = getModelConfig(modelValue);
  if (model?.pdf && isProUser) {
    return 'image/*,.pdf';
  }
  return 'image/*';
}

// Legacy arrays for backward compatibility (deprecated - use helper functions instead)
export const authRequiredModels = models.filter((m) => m.requiresAuth).map((m) => m.value);
export const proRequiredModels = models.filter((m) => m.pro).map((m) => m.value);
export const freeUnlimitedModels = models.filter((m) => m.freeUnlimited).map((m) => m.value);
