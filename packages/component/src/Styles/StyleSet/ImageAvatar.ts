import CSSTokens from '../CSSTokens';

export default function createImageAvatarStyle() {
  return {
    aspectRatio: 1,
    height: CSSTokens.SizeAvatar,
    overflow: ['hidden', 'clip'],
    width: CSSTokens.SizeAvatar
  };
}
