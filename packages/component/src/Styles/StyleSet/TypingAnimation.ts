import { StrictStyleOptions } from 'botframework-webchat-api';

import getDefaultTypingAnimationImageURL from '../private/getDefaultTypingAnimationImageURL';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/Middleware/TypingIndicator/TypingIndicator.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createTypingAnimationStyle({
  typingAnimationBackgroundImage,
  typingAnimationHeight,
  typingAnimationWidth
}: StrictStyleOptions) {
  const backgroundImage = typingAnimationBackgroundImage || `url('${getDefaultTypingAnimationImageURL()}')`;

  return {
    backgroundImage,
    backgroundRepeat: 'no-repeat',
    height: typingAnimationHeight,
    width: typingAnimationWidth
  };
}
