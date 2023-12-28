import { type StrictStyleOptions } from 'botframework-webchat-api';

export default function createInitialsAvatarStyle({
  accent,
  avatarSize,
  botAvatarBackgroundColor,
  primaryFont,
  userAvatarBackgroundColor
}: StrictStyleOptions) {
  return {
    '&.webchat__initialsAvatar': {
      alignItems: 'center',
      color: 'White',
      fontFamily: primaryFont,
      height: avatarSize,
      justifyContent: 'center',
      overflow: 'hidden',
      width: avatarSize,

      '&.webchat__initialsAvatar--fromUser': {
        backgroundColor: userAvatarBackgroundColor || accent
      },

      '&:not(.webchat__initialsAvatar--fromUser)': {
        backgroundColor: botAvatarBackgroundColor || accent
      }
    }
  };
}
