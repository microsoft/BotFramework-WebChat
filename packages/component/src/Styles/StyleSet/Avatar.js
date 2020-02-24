export default function createAvatarStyle({ avatarRadius, avatarSize }) {
  return {
    '&.webchat__defaultAvatar': {
      borderRadius: avatarRadius,
      height: avatarSize,
      width: avatarSize
    }
  };
}
