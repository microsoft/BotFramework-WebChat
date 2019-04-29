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

    '&:not(.from-user)': {
      '&.indented-content > .avatar': {
        marginRight: paddingRegular
      },

      '& > .content > .indented': {
        marginLeft: paddingRegular
      }
    },

    '&.from-user': {
      '&.indented-content > .avatar': {
        marginLeft: paddingRegular
      },

      '& > .content > .indented': {
        marginRight: paddingRegular
      }
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
    }
  };
}
