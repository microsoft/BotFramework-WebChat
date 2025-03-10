import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createSendBoxTextBoxStyle({
  paddingRegular,
  primaryFont,
  sendBoxDisabledTextColor,
  sendBoxMaxHeight,
  sendBoxPlaceholderColor,
  sendBoxTextColor,
  subtle
}: StrictStyleOptions) {
  return {
    '&.webchat__send-box-text-box': {
      alignItems: 'center',
      fontFamily: primaryFont,
      padding: paddingRegular,
      position: 'relative',

      '& .webchat__send-box-text-box__input': {
        border: 0,
        fontFamily: 'inherit',
        fontSize: 'inherit',
        height: '100%',
        outline: 0,
        padding: 0
      },

      '& .webchat__send-box-text-box__input, & .webchat__send-box-text-box__html-text-area': {
        backgroundColor: 'transparent', // We set this to transparent because we already applied "sendBoxBackground" to a parent container.

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

      '& .webchat__send-box-text-box__input, & .webchat__send-box-text-box__text-area': {
        maxHeight: sendBoxMaxHeight
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
