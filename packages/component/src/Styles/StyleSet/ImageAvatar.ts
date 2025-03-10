import CSSTokens from '../CSSTokens';

export default function createImageAvatarStyle() {
  return {
    alignItems: 'center',
    display: 'flex',
    height: CSSTokens.SizeAvatar,
    justifyContent: 'center',
    overflow: ['hidden', 'clip'],
    width: CSSTokens.SizeAvatar
  };
}
