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
      backgroundSize: 'cover',
      height: '100%',
      left: 0,
      position: 'absolute',
      top: 0,
      width: '100%'
    }
  };
}
