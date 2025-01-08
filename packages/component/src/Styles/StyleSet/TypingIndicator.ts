import { type StrictStyleOptions } from 'botframework-webchat-api';

export default function createTypingIndicatorStyle({ paddingRegular }: StrictStyleOptions) {
  return {
    paddingBottom: paddingRegular,

    '&:not(.webchat__typing-indicator--rtl)': {
      paddingLeft: paddingRegular
    },

    '&.webchat__typing-indicator--rtl': {
      paddingRight: paddingRegular
    }
  };
}
