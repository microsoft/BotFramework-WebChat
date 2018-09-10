import {
  primaryFont
} from '../Fonts';

export default function createAvatarStyle({ avatarSize }) {
  return {
    ...primaryFont,

    alignItems: 'center',
    backgroundColor: 'Black',
    borderRadius: '50%',
    color: 'White',
    display: 'flex',
    height: avatarSize,
    justifyContent: 'center',
    overflow: 'hidden',
    width: avatarSize
  };
}
