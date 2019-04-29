export default function createStackedLayoutStyle({ bubbleMaxWidth, bubbleMinWidth, paddingRegular }) {
  return {
    '&.extra-left-indent': {
      marginLeft: paddingRegular * 2
    },

    '&:not(.extra-left-indent)': {
      marginLeft: paddingRegular
    },

    '&.extra-right-indent': {
      marginRight: paddingRegular * 2
    },

    '&:not(.extra-right-indent)': {
      marginRight: paddingRegular
    },

    '& > .content': {
      '& > .webchat__row': {
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

    '&.from-user > .avatar': {
      marginLeft: paddingRegular
    },

    '&:not(.from-user) > .avatar': {
      marginRight: paddingRegular
    }
  };
}
