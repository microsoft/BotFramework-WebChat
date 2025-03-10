import { StrictStyleOptions } from 'botframework-webchat-api';

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
