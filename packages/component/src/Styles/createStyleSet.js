import { primaryFont } from '../Styles';

const DEFAULT_OPTIONS = {
  accent: '#6CF'
};

function createAvatarStyles() {
  return {
    ...primaryFont,

    alignItems: 'center',
    backgroundColor: 'Black',
    borderRadius: '50%',
    color: 'White',
    display: 'flex',
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 40
  };
}

export default function createStyleSet(options) {
  return {
    avatar: createAvatarStyles()
  };
}
