export default function createAvatarStyle({
  accent,
  avatarSize,
  botAvatarBackgroundColor,
  botAvatarBorderRadius,
  botAvatarFont,
  botAvatarFontSize,
  botAvatarTextColor,
  fontSizeSmall,
  primaryFont,
  userAvatarBackgroundColor,
  userAvatarBorderRadius,
  userAvatarFont,
  userAvatarFontSize,
  userAvatarTextColor
}) {
  return {
    alignItems: 'center',
    // TODO: [P2] We should not set "display" in styleSet, this will allow the user to break the layout for no good reasons.
    display: 'flex',
    fontFamily: primaryFont,
    height: avatarSize,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: avatarSize,

    '&.from-user': {
      backgroundColor: userAvatarBackgroundColor || accent,
      borderRadius: userAvatarBorderRadius,
      color: userAvatarTextColor || 'White',
      font: userAvatarFont || primaryFont,
      fontSize: userAvatarFontSize || fontSizeSmall
    },

    '&:not(.from-user)': {
      backgroundColor: botAvatarBackgroundColor || accent,
      borderRadius: botAvatarBorderRadius,
      color: botAvatarTextColor || 'White',
      font: botAvatarFont || primaryFont,
      fontSize: botAvatarFontSize || fontSizeSmall
    },

    '& > .image': {
      left: 0,
      position: 'absolute',
      top: 0
    }
  };
}
