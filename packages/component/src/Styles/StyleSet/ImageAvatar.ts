import { StyleOptions } from 'botframework-webchat-api';

export default function createImageAvatarStyle({ avatarSize }: StyleOptions) {
  return {
    height: avatarSize,
    overflow: 'hidden',
    width: avatarSize
  };
}
