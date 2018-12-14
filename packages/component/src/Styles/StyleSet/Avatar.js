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
    backgroundColor: accent,
    borderRadius: '50%',
    color: 'White',
    display: 'flex',
    height: avatarSize,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: avatarSize,

    '& > .image': {
      left: 0,
      position: 'absolute',
      top: 0
    }
  };
}
