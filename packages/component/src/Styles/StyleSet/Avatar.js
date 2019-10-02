export default function createAvatarStyle({
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
    // TODO: [P2] We should not set "display" in styleSet, this will allow the user to break the layout for no good reasons.
    display: 'flex',
    fontFamily: primaryFont,
    height: avatarSize,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: avatarSize,

    '&.from-user': {
      backgroundColor: userAvatarBackgroundColor || accent
    },

    '&:not(.from-user)': {
      backgroundColor: botAvatarBackgroundColor || accent
    },

    '& > .image': {
      left: 0,
      position: 'absolute',
      top: 0
    }
  };
}
