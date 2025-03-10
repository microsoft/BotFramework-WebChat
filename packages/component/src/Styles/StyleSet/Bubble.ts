/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */
import { StrictStyleOptions } from 'botframework-webchat-api';

import mirrorStyle from '../mirrorStyle';

export default function createBubbleStyle({
  bubbleBackground,
  bubbleBorderColor,
  bubbleBorderRadius,
  bubbleBorderStyle,
  bubbleBorderWidth,
  bubbleFromUserBackground,
  bubbleFromUserBorderColor,
  bubbleFromUserBorderRadius,
  bubbleFromUserBorderStyle,
  bubbleFromUserBorderWidth,
  bubbleFromUserNubOffset,
  bubbleFromUserNubSize,
  bubbleFromUserTextColor,
  bubbleMinHeight,
  bubbleNubOffset,
  bubbleNubSize,
  bubbleTextColor,
  messageActivityWordBreak,
  paddingRegular,
  transitionDuration
}: StrictStyleOptions) {
  const botNubCornerRadius =
    typeof bubbleNubOffset === 'number' ? Math.min(bubbleBorderRadius, Math.abs(bubbleNubOffset)) : bubbleBorderRadius;
  const userNubCornerRadius =
    typeof bubbleFromUserNubOffset === 'number'
      ? Math.min(bubbleFromUserBorderRadius, Math.abs(bubbleFromUserNubOffset))
      : bubbleFromUserBorderRadius;

  return {
    '&.webchat__bubble': {
      '& .webchat__bubble__content': {
        marginLeft: 0,
        marginRight: 0,
        transitionDuration,
        transitionProperty: 'margin-left, margin-right',
        wordBreak: messageActivityWordBreak
      },

      '& .webchat__bubble__nub': {
        overflow: 'hidden', // This style is for IE11 because it doesn't respect SVG viewport
        position: 'absolute'
      },

      '& .webchat__bubble__nub-pad': {
        transitionDuration,
        transitionProperty: 'width',
        width: 0
      },

      '&.webchat__bubble--hide-nub, &.webchat__bubble--show-nub': {
        '& .webchat__bubble__nub-pad': {
          width: paddingRegular
        }
      },

      '&.webchat__bubble--rtl .webchat__bubble__nub': {
        transform: 'scale(-1, 1)'
      },

      '&:not(.webchat__bubble--from-user)': {
        '& .webchat__bubble__content': {
          background: bubbleBackground,
          borderColor: bubbleBorderColor,
          borderRadius: bubbleBorderRadius,
          borderStyle: bubbleBorderStyle,
          borderWidth: bubbleBorderWidth,
          color: bubbleTextColor,
          minHeight: bubbleMinHeight - bubbleBorderWidth * 2
        },

        ...(typeof bubbleNubSize === 'number'
          ? {
              '& .webchat__bubble__nub': {
                height: bubbleNubSize,
                width: bubbleNubSize
              }
            }
          : {}),

        '&:not(.webchat__bubble--nub-on-top) .webchat__bubble__nub': {
          bottom: -bubbleNubOffset
        },

        '&.webchat__bubble--nub-on-top .webchat__bubble__nub': {
          top: bubbleNubOffset
        },

        '& .webchat__bubble__nub-outline': {
          fill: bubbleBackground,
          stroke: bubbleBorderColor,
          strokeWidth: bubbleBorderWidth
        }
      },

      '&.webchat__bubble--from-user': {
        flexDirection: 'row-reverse',

        '& .webchat__bubble__content': {
          background: bubbleFromUserBackground,
          borderColor: bubbleFromUserBorderColor,
          borderRadius: bubbleFromUserBorderRadius,
          borderStyle: bubbleFromUserBorderStyle,
          borderWidth: bubbleFromUserBorderWidth,
          color: bubbleFromUserTextColor,
          minHeight: bubbleMinHeight - bubbleFromUserBorderWidth * 2
        },

        ...(typeof bubbleFromUserNubSize === 'number'
          ? {
              '& .webchat__bubble__nub': {
                height: bubbleFromUserNubSize,
                width: bubbleFromUserNubSize
              }
            }
          : {}),

        '&:not(.webchat__bubble--nub-on-top) .webchat__bubble__nub': {
          bottom: -bubbleFromUserNubOffset
        },

        '&.webchat__bubble--nub-on-top .webchat__bubble__nub': {
          top: bubbleFromUserNubOffset
        },

        '& .webchat__bubble__nub-outline': {
          fill: bubbleFromUserBackground,
          stroke: bubbleFromUserBorderColor,
          strokeWidth: bubbleFromUserBorderWidth
        }
      },

      ...mirrorStyle('&.webchat__bubble--rtl', {
        '&:not(.webchat__bubble--from-user)': {
          '&.webchat__bubble--show-nub': {
            // Hide border radius if there is a nub on the top/bottom left corner
            '&:not(.webchat__bubble--nub-on-top) .webchat__bubble__content': {
              borderBottomLeftRadius: botNubCornerRadius
            },

            '&.webchat__bubble--nub-on-top .webchat__bubble__content': {
              borderTopLeftRadius: botNubCornerRadius
            }
          },

          ...(typeof bubbleNubSize === 'number'
            ? {
                '& .webchat__bubble__nub': { left: bubbleBorderWidth - bubbleNubSize + paddingRegular }
              }
            : {})
        },

        '&.webchat__bubble--from-user': {
          '&.webchat__bubble--show-nub': {
            // Hide border radius if there is a nub on the top/bottom right corner
            '&:not(.webchat__bubble--nub-on-top) .webchat__bubble__content': {
              borderBottomRightRadius: userNubCornerRadius
            },

            '&.webchat__bubble--nub-on-top .webchat__bubble__content': {
              borderTopRightRadius: userNubCornerRadius
            }
          },

          ...(typeof bubbleFromUserNubSize === 'number'
            ? {
                '& .webchat__bubble__nub': { right: bubbleFromUserBorderWidth - bubbleFromUserNubSize + paddingRegular }
              }
            : {})
        }
      })
    }
  };
}
