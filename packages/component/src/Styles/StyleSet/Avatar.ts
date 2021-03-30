import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createAvatarStyle({ avatarBorderRadius, avatarSize }: StrictStyleOptions) {
  return {
    '&.webchat__defaultAvatar': {
      borderRadius: avatarBorderRadius,
      height: avatarSize,
      width: avatarSize
    }
  };
}
