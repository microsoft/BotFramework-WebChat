/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

export default function CarouselFilmStrip({
  avatarSize,
  bubbleMaxWidth,
  bubbleMinWidth,
  paddingRegular,
  transitionDuration
}) {
  return {
    '&.webchat__carousel-layout': {
      // Browser quirks: Firefox has no way to hide scrollbar and while keeping it in function
      // https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
      '@supports (-moz-appearance: none)': {
        marginBottom: -17
      },

      '& .webchat__carousel-layout__attachment, .webchat__carousel-layout__message': {
        maxWidth: bubbleMaxWidth,
        minWidth: bubbleMinWidth,
        transitionDuration,
        transitionProperty: 'max-width, min-width'
      },

      '&.webchat__carousel-layout--hide-nub, &.webchat__carousel-layout--show-nub, &.webchat__carousel-layout--hide-avatar, &.webchat__carousel-layout--show-avatar': {
        '& .webchat__carousel-layout__message': {
          maxWidth: bubbleMaxWidth + paddingRegular
        }
      },

      '& .webchat__carousel-layout__attachments': {
        marginTop: paddingRegular
      },

      '& .webchat__carousel-layout__avatar-gutter, & .webchat__carousel-layout__nub-pad': {
        flexShrink: 0,
        transitionDuration,
        transitionProperty: 'width',
        width: 0
      },

      '&.webchat__carousel-layout--hide-avatar, &.webchat__carousel-layout--show-avatar': {
        '& .webchat__carousel-layout__avatar-gutter': {
          width: avatarSize
        }
      },

      '&.webchat__carousel-layout--hide-avatar, &.webchat__carousel-layout--show-avatar, &.webchat__carousel-layout--hide-nub, &.webchat__carousel-layout--show-nub': {
        '& .webchat__carousel-layout__nub-pad': {
          width: paddingRegular
        }
      },

      '& .webchat__carousel-layout__avatar-gutter': {
        display: 'flex',
        flexDirection: 'column'
      },

      '&:not(.webchat__carousel-layout--top-callout) .webchat__carousel-layout__avatar-gutter': {
        justifyContent: 'flex-end'
      },

      '&:not(.webchat__carousel-layout--rtl)': {
        paddingLeft: paddingRegular,

        '& .webchat__carousel-layout__content': {
          paddingRight: paddingRegular
        },

        '& .webchat__carousel-layout__attachments': {
          marginLeft: -paddingRegular
        },

        '& .webchat__carousel-layout__attachment': {
          paddingLeft: paddingRegular
        },

        '&.webchat__carousel-layout--extra-trailing .webchat__carousel-layout__content': {
          paddingRight: paddingRegular * 2
        },

        '&.webchat__carousel-layout--hide-avatar, &.webchat__carousel-layout--show-avatar': {
          '& .webchat__carousel-layout__attachments': {
            marginLeft: -(avatarSize + paddingRegular * 2)
          },

          '& .webchat__carousel-layout__attachment:first-child': {
            paddingLeft: avatarSize + paddingRegular * 2
          }
        },

        '&.webchat__carousel-layout--hide-nub, &.webchat__carousel-layout--show-nub': {
          '&:not(.webchat__carousel-layout--hide-avatar.webchat__carousel-layout--show-avatar)': {
            '& .webchat__carousel-layout__attachments': {
              marginLeft: -paddingRegular * 2
            },

            '& .webchat__carousel-layout__attachment:first-child': {
              paddingLeft: paddingRegular * 2
            }
          }
        }
      }
    }
  };
}
