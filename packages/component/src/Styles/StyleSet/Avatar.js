import {
  primaryFont
} from '../Fonts';

export default function createAvatarStyle({
  accent,
  avatarSize
}) {
  return {
    ...primaryFont,

    alignItems: 'center',
    backgroundColor: 'Transparent',
    borderRadius: '50%',
    color: 'White',
    display: 'flex',
    height: avatarSize,
    justifyContent: 'center',
    overflow: 'hidden',
    width: avatarSize,

      '& img': {
          height: avatarSize,
      }
  };
}
