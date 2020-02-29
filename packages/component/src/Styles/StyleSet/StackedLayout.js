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
    '&:not(.webchat__stackedLayout--rtl)': {
      '&:not(.webchat__stackedLayout--fromUser)': {
        '&.webchat__stacked_indented_content > .webchat__stackedLayout__avatar': {
          marginRight: paddingRegular
        },

        '& > .webchat__stackedLayout__content > .webchat__stacked_item_indented': {
          marginLeft: paddingRegular
        }
      },

      '&.webchat__stackedLayout--fromUser': {
        '&.webchat__stacked_indented_content > .webchat__stackedLayout__avatar': {
          marginLeft: paddingRegular
        },

        '& > .webchat__stackedLayout__content > .webchat__stacked_item_indented': {
          marginRight: paddingRegular
        }
      }
    },

    '&.webchat__stackedLayout--rtl': {
      '&:not(.webchat__stackedLayout--fromUser)': {
        '&.webchat__stacked_indented_content > .webchat__stackedLayout__avatar': {
          marginLeft: paddingRegular
        },

        '& > .webchat__stackedLayout__content > .webchat__stacked_item_indented': {
          marginRight: paddingRegular
        }
      },

      '&.webchat__stackedLayout--fromUser': {
        '&.webchat__stacked_indented_content > .webchat__stackedLayout__avatar': {
          marginRight: paddingRegular
        },

        '& > .webchat__stackedLayout__content > .webchat__stacked_item_indented': {
          marginLeft: paddingRegular
        }
      }
    },

    '& > .webchat__stackedLayout__content': {
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
