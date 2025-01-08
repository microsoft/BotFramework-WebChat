import { type StrictStyleOptions } from 'botframework-webchat-api';
import CSSTokens from '../CSSTokens';

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
