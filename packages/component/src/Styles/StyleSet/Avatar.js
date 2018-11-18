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
    border: '2px solid rgba(0,0,0,.2)',
    transition: 'border .3s ease-in-out',

      '&:hover': {
          transition: '2px solid #77d6f5',
      },

      '& img': {
          height: avatarSize,
      }
  };
}
