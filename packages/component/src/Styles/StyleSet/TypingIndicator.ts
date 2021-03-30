import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createTypingIndicatorStyle({ paddingRegular }: StrictStyleOptions) {
  return {
    paddingBottom: paddingRegular,

    '&:not(.webchat__typingIndicator--rtl)': {
      paddingLeft: paddingRegular
    },

    '&.webchat__typingIndicator--rtl': {
      paddingRight: paddingRegular
    }
  };
}
