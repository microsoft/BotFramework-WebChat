export default function createStackedLayoutStyle({ bubbleMaxWidth, bubbleMinWidth, paddingRegular }) {
  return {
    marginLeft: paddingRegular,
    marginRight: paddingRegular,

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
