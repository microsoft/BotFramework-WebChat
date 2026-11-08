import { StrictStyleOptions } from 'botframework-webchat-api';
import CSSTokens from '../CSSTokens';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/Avatar/Avatar.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createInitialsAvatarStyle({
  accent,
  botAvatarBackgroundColor,
  userAvatarBackgroundColor
}: StrictStyleOptions) {
  return {
    '&.webchat__initialsAvatar': {
      alignItems: 'center',
      color: 'White',
      fontFamily: CSSTokens.FontPrimary,
      height: CSSTokens.SizeAvatar,
      justifyContent: 'center',
      overflow: 'hidden',
      width: CSSTokens.SizeAvatar,

      '&.webchat__initialsAvatar--fromUser': {
        backgroundColor: userAvatarBackgroundColor || accent
      },

      '&:not(.webchat__initialsAvatar--fromUser)': {
        backgroundColor: botAvatarBackgroundColor || accent
      }
    }
  };
}
