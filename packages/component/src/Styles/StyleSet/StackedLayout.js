export default function ({
  bubbleMaxWidth,
  bubbleMinWidth,
  paddingRegular
}) {
  return {
    marginLeft: paddingRegular,
    marginRight: paddingRegular,

    '& > .content': {
      '& > .row': {
        '& > .bubble, & > .timestamp': {
          maxWidth: bubbleMaxWidth
        },

        '&.attachment > .bubble': {
          minWidth: bubbleMinWidth
        }
      },

      '& > *:not(:first-child):not(:last-child)': {
        marginTop: paddingRegular
      }
    },

    '&.ltr.from-user > .avatar': {
      marginLeft: paddingRegular
    },

    '&.ltr:not(.from-user) > .avatar': {
      marginRight: paddingRegular
    },

    '&.rtl.from-user > .avatar': {
      marginRight: paddingRegular
    },

    '&.rtl:not(.from-user) > .avatar': {
      marginLeft: paddingRegular
    }
  };
}
