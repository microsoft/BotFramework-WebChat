import { normalizeStyleOptions, StrictStyleOptions, StyleOptions } from 'botframework-webchat-api';

import AdaptiveCardsStyleOptions, { StrictAdaptiveCardsStyleOptions } from '../AdaptiveCardsStyleOptions';
import AdaptiveCardsStyleSet from '../AdaptiveCardsStyleSet';
import createAdaptiveCardRendererStyle from './StyleSet/AdaptiveCardRenderer';
import createAnimationCardAttachmentStyle from './StyleSet/AnimationCardAttachment';
import createAudioCardAttachmentStyle from './StyleSet/AudioCardAttachment';
import normalizeAdaptiveCardsStyleOptions from '../normalizeStyleOptions';

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
