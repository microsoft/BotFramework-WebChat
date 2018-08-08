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
    marginLeft: 10,
    marginRight: 10,
    overflow: 'hidden',
    width: avatarSize
  };
}
