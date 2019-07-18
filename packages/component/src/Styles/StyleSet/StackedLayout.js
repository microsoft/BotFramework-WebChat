/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

export default function createStackedLayoutStyle({ bubbleMaxWidth, bubbleMinWidth, paddingRegular }) {
  return {
    '&.webchat__stacked_extra_left_indent': {
      marginLeft: paddingRegular * 2
    },

    '&:not(.webchat__stacked_extra_left_indent)': {
      marginLeft: paddingRegular
    },

    '&.webchat__stacked_extra_right_indent': {
      marginRight: paddingRegular * 2
    },

    '&:not(.webchat__stacked_extra_right_indent)': {
      marginRight: paddingRegular
    },

    '&:not(.from-user)': {
      '&.webchat__stacked_indented_content > .avatar': {
        marginRight: paddingRegular
      },

      '& > .content > .webchat__stacked_item_indented': {
        marginLeft: paddingRegular
      }
    },

    '&.from-user': {
      '&.webchat__stacked_indented_content > .avatar': {
        marginLeft: paddingRegular
      },

      '& > .content > .webchat__stacked_item_indented': {
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
