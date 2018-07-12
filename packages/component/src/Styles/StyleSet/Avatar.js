import {
  primaryFont
} from '../Fonts';

export default function createAvatarStyle() {
  return {
    ...primaryFont,

    alignItems: 'center',
    backgroundColor: 'Black',
    borderRadius: '50%',
    color: 'White',
    display: 'flex',
    height: 40,
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10,
    overflow: 'hidden',
    width: 40
  };
}
