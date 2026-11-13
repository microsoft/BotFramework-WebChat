import { StrictStyleOptions } from 'botframework-webchat-api';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/SendBox/SendBox.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createUploadButtonStyle({
  sendBoxButtonColor,
  sendBoxButtonColorOnFocus,
  sendBoxButtonColorOnHover,
  sendBoxHeight,
  subtle
}: StrictStyleOptions) {
  return {
    // We use the sendBoxHeight, so the button looks square
    width: sendBoxHeight,

    '& > .icon > svg': {
      fill: sendBoxButtonColor || subtle
    },

    '& > input:hover + .icon > svg': {
      fill: sendBoxButtonColorOnHover
    },

    '& > input:focus + .icon > svg': {
      fill: sendBoxButtonColorOnFocus
    }
  };
}
