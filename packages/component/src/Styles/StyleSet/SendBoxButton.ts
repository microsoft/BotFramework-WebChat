import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createSendBoxButtonStyle({
  sendBoxButtonColor,
  sendBoxButtonColorOnDisabled,
  sendBoxButtonColorOnFocus,
  sendBoxButtonColorOnHover,
  sendBoxHeight,
  subtle
}: StrictStyleOptions) {
  return {
    '&.webchat__icon-button': {
      alignItems: 'center',
      backgroundColor: 'Transparent',
      border: 0,
      display: 'flex',
      justifyContent: 'center',
      outline: 0,
      padding: 0,

      // We use the sendBoxHeight, so the button looks square
      width: sendBoxHeight,

      '&:not(.webchat__icon-button--stretch)': {
        height: sendBoxHeight
      },

      '&:not(:disabled):not([aria-disabled="true"])': {
        '&:focus svg': {
          fill: sendBoxButtonColorOnFocus
        },

        '&:hover svg': {
          fill: sendBoxButtonColorOnHover
        }
      },

      '& svg': {
        fill: sendBoxButtonColor || subtle
      },

      '&:disabled, &[aria-disabled="true"]': {
        '& svg': {
          fill: sendBoxButtonColorOnDisabled
        }
      }
    }
  };
}
