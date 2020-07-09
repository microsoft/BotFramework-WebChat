/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

export default function createStackedLayoutStyle({ avatarSize, bubbleMaxWidth, bubbleMinWidth, paddingRegular }) {
  return {
    '&.webchat__stacked-layout': {
      marginLeft: paddingRegular,
      marginRight: paddingRegular,

      '&.webchat__stacked-layout--from-user': {
        '& .webchat__stacked-layout__main-row, & .webchat__stacked-layout__content-row, & .webchat__stacked-layout__status-row': {
          flexDirection: 'row-reverse'
        }
      },

      '&.webchat__stacked-layout--extra-indent': {
        '&:not(.webchat__stacked-layout--right-side)': {
          marginRight: paddingRegular * 2
        },

        '&.webchat__stacked-layout--right-side': {
          marginLeft: paddingRegular * 2
        }
      },

      // '&.webchat__stacked-layout--extra-left-indent': {
      //   marginLeft: paddingRegular * 2
      // },

      // '&.webchat__stacked-layout--extra-right-indent': {
      //   marginRight: paddingRegular * 2
      // },

      '&:not(.webchat__stacked-layout--right-side)': {
        '& .webchat__stacked-layout__avatar-column.webchat__stacked-layout__avatar-column--indented': {
          marginRight: paddingRegular
        },

        '& .webchat__stacked-layout__content-row.webchat__stacked-layout__content-row--indented': {
          marginLeft: paddingRegular
        }
      },

      '&.webchat__stacked-layout--right-side': {
        '& .webchat__stacked-layout__avatar-column.webchat__stacked-layout__avatar-column--indented': {
          marginLeft: paddingRegular
        },

        '& .webchat__stacked-layout__content-row.webchat__stacked-layout__content-row--indented': {
          marginRight: paddingRegular
        }
      },

      // Can we simplify this?
      '& .webchat__stacked-layout__content-row:not(:first-child)': {
        marginTop: paddingRegular
      },

      '& .webchat__stacked-layout__message-bubble': {
        maxWidth: bubbleMaxWidth,

        '&.webchat__stacked-layout__messeage-bubble--show-nub': {
          maxWidth: bubbleMaxWidth + paddingRegular
        }
      },

      '& .webchat__stacked-layout__attachment-bubble': {
        maxWidth: bubbleMaxWidth,
        minWidth: bubbleMinWidth
      },

      '& .webchat__stacked-layout__avatar-column': {
        width: avatarSize
      },

      '& .webchat__stacked-layout__avatar-column.webchat__stacked-layout__avatar-column--align-bottom': {
        alignItems: 'flex-end'
      },

      '& .webchat__stacked-layout__avatar-filler': {
        '&.webchat__stacked-layout__avatar-filler--for-avatar': {
          width: avatarSize + paddingRegular
        },

        '&.webchat__stacked-layout__avatar-filler--for-nub:not(.webchat__stacked-layout__avatar-filler--for-avatar)': {
          width: paddingRegular
        }
      }
    }
  };
}
