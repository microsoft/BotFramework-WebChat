import { StrictStyleOptions } from 'botframework-webchat-api';
import CSSTokens from '../CSSTokens';

export default function createAvatarStyle({ avatarBorderRadius }: StrictStyleOptions) {
  return {
    '&.webchat__defaultAvatar': {
      borderRadius: avatarBorderRadius,
      height: CSSTokens.SizeAvatar,
      width: CSSTokens.SizeAvatar
    }
  };
}
