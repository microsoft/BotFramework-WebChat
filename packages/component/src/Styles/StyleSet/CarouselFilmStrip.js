export default function ({
  bubbleMaxWidth,
  bubbleMinWidth,
  paddingRegular
}) {
  return {
    // Browser quirks: Firefox has no way to hide scrollbar and while keeping it in function
    // https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
    marginBottom: -17,
    paddingLeft: paddingRegular,
    paddingRight: paddingRegular,

    '& > .avatar': {
      marginRight: paddingRegular
    },

    '& > .content > ul': {
      '&:not(:first-child)': {
        marginTop: paddingRegular
      },

      '& > li': {
        marginRight: paddingRegular,
        maxWidth: bubbleMaxWidth,
        minWidth: bubbleMinWidth
      }
    }
  };
}
