import { StrictStyleOptions } from 'botframework-webchat-api';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/BasicWebChat.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function ({
  backgroundColor,
  rootHeight: height,
  rootWidth: width,
  rootZIndex: zIndex
}: StrictStyleOptions) {
  return {
    backgroundColor,
    height,
    width,
    zIndex
  };
}
