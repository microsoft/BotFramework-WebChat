import { createStyleSet as createBasicStyleSet, defaultStyleOptions } from 'botframework-webchat-component';
import createAdaptiveCardRendererStyle from './StyleSet/AdaptiveCardRenderer';
import createAnimationCardAttachmentStyle from './StyleSet/AnimationCardAttachment';
import createAudioCardAttachmentStyle from './StyleSet/AudioCardAttachment';

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.

export default function createStyleSet(options) {
  options = { ...defaultStyleOptions, ...options };

  const basicStyleSet = createBasicStyleSet(options);

  // Keep this list flat (no nested style) and serializable (no functions)

  return {
    ...basicStyleSet,
    adaptiveCardRenderer: createAdaptiveCardRendererStyle(options),
    animationCardAttachment: createAnimationCardAttachmentStyle(options),
    audioCardAttachment: createAudioCardAttachmentStyle(options)
  };
}
