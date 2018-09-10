export default function ({
  bubbleMaxWidth,
  bubbleMinWidth,
  paddingRegular
}) {
  return {
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
