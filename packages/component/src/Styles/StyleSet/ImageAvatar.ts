import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createImageAvatarStyle({ avatarSize }: StrictStyleOptions) {
  return {
    height: avatarSize,
    overflow: 'hidden',
    width: avatarSize
  };
}
