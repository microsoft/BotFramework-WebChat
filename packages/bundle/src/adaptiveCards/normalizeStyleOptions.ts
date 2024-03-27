import { type StrictAdaptiveCardsStyleOptions } from './AdaptiveCardsStyleOptions';
import type AdaptiveCardsStyleOptions from './AdaptiveCardsStyleOptions';
import defaultStyleOptions from './defaultStyleOptions';

export default function normalizeStyleOptions(
  styleOptions: AdaptiveCardsStyleOptions
): StrictAdaptiveCardsStyleOptions {
  return { ...defaultStyleOptions, ...styleOptions };
}
