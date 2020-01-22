/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

export default function createStackedLayoutStyle({ bubbleMaxWidth, bubbleMinWidth, paddingRegular }) {
  const doublePadding = paddingRegular * 2;
  return {
    '&.webchat__stacked_extra_left_indent': {
      marginLeft: doublePadding,
      marginRight: doublePadding
    },

    '&:not(.webchat__stacked_extra_left_indent)': {
      marginLeft: paddingRegular,
      marginRight: paddingRegular
    },

    '&.webchat__stacked_extra_right_indent': {
      marginLeft: doublePadding,
      marginRight: doublePadding
    },

    '&:not(.webchat__stacked_extra_right_indent)': {
      marginLeft: paddingRegular,
      marginRight: paddingRegular
    },

    '&:not(.from-user)': {
      '&.webchat__stacked_indented_content > .avatar': {
        marginLeft: paddingRegular,
        marginRight: paddingRegular
      },

      '& > .content > .webchat__stacked_item_indented': {
        marginLeft: paddingRegular,
        marginRight: paddingRegular
      }
    },

    '&.from-user': {
      '&.webchat__stacked_indented_content > .avatar': {
        marginLeft: paddingRegular,
        marginRight: paddingRegular
      },

      '& > .content > .webchat__stacked_item_indented': {
        marginLeft: paddingRegular,
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
