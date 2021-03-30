import { StrictStyleOptions } from 'botframework-webchat-api';

import { StrictAdaptiveCardsStyleOptions } from '../AdaptiveCardsStyleOptions';
import createAdaptiveCardRendererStyle from './StyleSet/AdaptiveCardRenderer';
import createAnimationCardAttachmentStyle from './StyleSet/AnimationCardAttachment';
import createAudioCardAttachmentStyle from './StyleSet/AudioCardAttachment';

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.

export default function createAdaptiveCardsStyleSet(
  options: StrictStyleOptions & StrictAdaptiveCardsStyleOptions
): any {
  return {
    adaptiveCardRenderer: createAdaptiveCardRendererStyle(options),
    animationCardAttachment: createAnimationCardAttachmentStyle(),
    audioCardAttachment: createAudioCardAttachmentStyle(options)
  };
}
