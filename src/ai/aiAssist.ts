import { createLocalAssistText } from './aiPrompts';
import type { AiAssistContext, AiAssistOptions, AiAssistResult } from './aiTypes';

const containsProhibitedClinicalClaims = (text: string): boolean =>
  /\b(diagnos(?:e|is|ed|ing)|treat(?:ment|ments)?|cure|prognos(?:is|tic)|prescrib(?:e|ed|ing)|dosage|disease prediction|medical urgency|guaranteed outcome)\b/i.test(text);

/** Optional provider adapter. No provider is configured in this prototype. */
export const runAiAssist = (context: AiAssistContext, options: AiAssistOptions): AiAssistResult => {
  const sourceIds = [...new Set(context.sourceIds.filter(Boolean))];
  if (options.provider && options.isOnline) {
    try {
      const text = options.provider.generate(context).trim();
      if (text && !containsProhibitedClinicalClaims(text)) return { text, sourceIds, mode: 'OPTIONAL PROVIDER' };
    } catch {
      return {
        text: createLocalAssistText(context),
        sourceIds,
        mode: 'LOCAL FALLBACK',
        notice: 'AI assist unavailable — using rule-based summary.',
      };
    }
    return {
      text: createLocalAssistText(context),
      sourceIds,
      mode: 'LOCAL FALLBACK',
      notice: 'AI assist unavailable — using rule-based summary.',
    };
  }
  return { text: createLocalAssistText(context), sourceIds, mode: 'LOCAL FALLBACK' };
};

export type { AiAssistContext, AiAssistOptions, AiAssistResult, AiTextProvider } from './aiTypes';
