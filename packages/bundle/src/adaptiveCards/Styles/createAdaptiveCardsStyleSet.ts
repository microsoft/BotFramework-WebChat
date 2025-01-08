import { normalizeStyleOptions, StrictStyleOptions, StyleOptions } from 'botframework-webchat-api';

import { type AdaptiveCardsStyleOptions, type StrictAdaptiveCardsStyleOptions } from '../AdaptiveCardsStyleOptions';
import { type AdaptiveCardsStyleSet } from '../AdaptiveCardsStyleSet';
import normalizeAdaptiveCardsStyleOptions from '../normalizeStyleOptions';
import createAdaptiveCardRendererStyle from './StyleSet/AdaptiveCardRenderer';
import createAnimationCardAttachmentStyle from './StyleSet/AnimationCardAttachment';
import createAudioCardAttachmentStyle from './StyleSet/AudioCardAttachment';

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.

export default function createAdaptiveCardsStyleSet(
  options: StyleOptions & AdaptiveCardsStyleOptions
): AdaptiveCardsStyleSet {
  const strictOptions: StrictStyleOptions & StrictAdaptiveCardsStyleOptions = {
    ...normalizeStyleOptions(options),
    ...normalizeAdaptiveCardsStyleOptions(options)
  };

  return {
    adaptiveCardRenderer: createAdaptiveCardRendererStyle(strictOptions),
    animationCardAttachment: createAnimationCardAttachmentStyle(),
    audioCardAttachment: createAudioCardAttachmentStyle(strictOptions)
  };
}
