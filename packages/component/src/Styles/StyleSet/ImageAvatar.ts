import CSSTokens from '../CSSTokens';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/Avatar/Avatar.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
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
