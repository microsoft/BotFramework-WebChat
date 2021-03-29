import { StyleOptions } from 'botframework-webchat-api';

export default function createAvatarStyle({ avatarBorderRadius, avatarSize }: StyleOptions) {
  return {
    '&.webchat__defaultAvatar': {
      borderRadius: avatarBorderRadius,
      height: avatarSize,
      width: avatarSize
    }
  };
}
