export default function createInitialsAvatarStyle({
  accent,
  avatarSize,
  botAvatarBackgroundColor,
  primaryFont,
  userAvatarBackgroundColor
}) {
  return {
    alignItems: 'center',
    borderRadius: '50%',
    color: 'White',
    fontFamily: primaryFont,
    height: avatarSize,
    justifyContent: 'center',
    overflow: 'hidden',
    width: avatarSize,

    '&.from-user': {
      backgroundColor: userAvatarBackgroundColor || accent
    },

    '&:not(.from-user)': {
      backgroundColor: botAvatarBackgroundColor || accent
    }
  };
}
