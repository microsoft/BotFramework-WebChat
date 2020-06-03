export default function createSendBoxTextBoxStyle({
  primaryFont,
  sendBoxBackground,
  sendBoxDisabledTextColor,
  sendBoxPlaceholderColor,
  sendBoxTextColor,
  subtle
}) {
  return {
    '&.webchat__send-box-text-box': {
      alignItems: 'center',
      fontFamily: primaryFont,
      position: 'relative',

      '& .webchat__send-box-text-box__input': {
        backgroundColor: sendBoxBackground,
        border: 0,
        fontFamily: 'inherit',
        fontSize: 'inherit',
        height: '100%',
        outline: 0,
        padding: 0,

        '&:not(:disabled):not([aria-disabled="true"])': {
          color: sendBoxTextColor
        },

        '&:disabled, &[aria-disabled="true"]': {
          color: sendBoxDisabledTextColor || subtle
        },

        '&::placeholder': {
          color: sendBoxPlaceholderColor || subtle
        }
      },

      '& .webchat__send-box-text-box__glass': {
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        userSelect: 0,
        width: '100%'
      }
    }
  };
}
