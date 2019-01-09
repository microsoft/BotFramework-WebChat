export default function ({
  bubbleMaxWidth,
  bubbleMinWidth,
  paddingRegular
}) {
  return {
    // Browser quirks: Firefox has no way to hide scrollbar and while keeping it in function
    // https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
    '@supports (-moz-appearance: none)': {
      marginBottom: -17
    },

    '& > .avatar': {
      marginRight: paddingRegular
    },

    '& > .content': {
      '& > .message': {
        marginLeft: paddingRegular
      },

      '& > ul': {
        '&:not(:first-child)': {
          marginLeft: paddingRegular,
          marginRight: paddingRegular,
          marginTop: paddingRegular
        },

        '& > li': {
          maxWidth: bubbleMaxWidth,
          minWidth: bubbleMinWidth,

          '&:not(:last-child)': {
            marginRight: paddingRegular
          }
        }
      },

      '& > .row': {
        marginLeft: paddingRegular
      }
    }
  };
}
