import { StrictStyleOptions } from 'botframework-webchat-api';
import CSSTokens from '../CSSTokens';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/Avatar/Avatar.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createAvatarStyle({ avatarBorderRadius }: StrictStyleOptions) {
  return {
    '&.webchat__defaultAvatar': {
      borderRadius: avatarBorderRadius,
      height: CSSTokens.SizeAvatar,
      width: CSSTokens.SizeAvatar
    }
  };
}
