/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import mirrorStyle from '../mirrorStyle';

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

      '& .webchat__carousel-layout__attachment': {
        minWidth: bubbleMinWidth,
        maxWidth: bubbleMaxWidth,
        transitionDuration,
        transitionProperty: 'max-width, min-width'
      },

      '& .webchat__carousel-layout__message': {
        maxWidth: bubbleMaxWidth,
        transitionDuration,
        transitionProperty: 'max-width'
      },

      '&.webchat__carousel-layout--hide-nub, &.webchat__carousel-layout--show-nub, &.webchat__carousel-layout--hide-avatar, &.webchat__carousel-layout--show-avatar': {
        '& .webchat__carousel-layout__message': {
          maxWidth: bubbleMaxWidth + paddingRegular
        }
      },

      '& .webchat__carousel-layout__alignment-pad': {
        transitionDuration,
        transitionProperty: 'width',
        width: paddingRegular
      },

      '&.webchat__carousel-layout--extra-trailing .webchat__carousel-layout__alignment-pad': {
        width: paddingRegular * 2
      },

      '&:not(.webchat__carousel-layout--no-message) .webchat__carousel-layout__attachments': {
        marginTop: paddingRegular
      },

      '& .webchat__carousel-layout__avatar-gutter': {
        alignItems: 'flex-end',
        transitionDuration,
        transitionProperty: 'width'
      },

      '& .webchat__carousel-layout__nub-pad': {
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

      '&:not(.webchat__carousel-layout--top-callout) .webchat__carousel-layout__avatar-gutter': {
        justifyContent: 'flex-end'
      },

      ...mirrorStyle('.webchat__carousel-layout--rtl', {
        '& .webchat__carousel-layout__avatar-gutter': {
          marginLeft: paddingRegular
        },

        '& .webchat__carousel-layout__attachments': {
          marginLeft: -paddingRegular
        },

        '& .webchat__carousel-layout__attachment': {
          paddingLeft: paddingRegular
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
      })
    }
  };
}
