export default function createSendBoxButtonStyle({
  sendBoxButtonColor,
  sendBoxButtonColorOnDisabled,
  sendBoxButtonColorOnFocus,
  sendBoxButtonColorOnHover,
  sendBoxHeight,
  subtle
}) {
  return {
    '&.webchat__icon-button': {
      height: '100%',
      position: 'relative',

      '& .webchat__icon-button__button': {
        backgroundColor: 'Transparent',
        border: 0,
        height: '100%',
        outline: 0,
        padding: 0,

        // We use the sendBoxHeight, so the button looks square
        width: sendBoxHeight,

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
      },

      '& .webchat__icon-button__glass': {
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        userSelect: 'none',
        width: '100%'
      }
    }
  };
}
