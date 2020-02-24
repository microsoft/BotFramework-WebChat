export default function createAvatarStyle({ avatarBorderRadius, avatarSize }) {
  return {
    '&.webchat__defaultAvatar': {
      borderRadius: avatarBorderRadius,
      height: avatarSize,
      width: avatarSize
    }
  };
}
