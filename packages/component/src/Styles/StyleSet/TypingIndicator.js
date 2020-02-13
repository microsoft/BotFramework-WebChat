export default function createTypingIndicatorStyle({ paddingRegular }) {
  return {
    paddingBottom: paddingRegular,

    '&:not(.rtl)': {
      paddingLeft: paddingRegular
    },
    '&.rtl': {
      paddingRight: paddingRegular
    }
  };
}
