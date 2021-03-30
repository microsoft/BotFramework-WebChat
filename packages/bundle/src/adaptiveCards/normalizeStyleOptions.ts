import AdaptiveCardsStyleOptions, { StrictAdaptiveCardsStyleOptions } from './AdaptiveCardsStyleOptions';
import defaultStyleOptions from './defaultStyleOptions';

export default function normalizeStyleOptions(
  styleOptions: AdaptiveCardsStyleOptions
): StrictAdaptiveCardsStyleOptions {
  return { ...defaultStyleOptions, ...styleOptions };
}
