export default function createTypingIndicatorStyle({ paddingRegular }) {
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
