/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */

import isZeroOrPositive from '../../Utils/isZeroOrPositive';

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
}) {
  const botNubUpSideDown = !isZeroOrPositive(bubbleNubOffset);
  const userNubUpSideDown = !isZeroOrPositive(bubbleFromUserNubOffset);

  const botNubCornerRadius = Math.min(bubbleBorderRadius, Math.abs(bubbleNubOffset));
  const userNubCornerRadius = Math.min(bubbleFromUserBorderRadius, Math.abs(bubbleFromUserNubOffset));

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
        overflow: 'hidden', // This style is for IE11 because it don't respect SVG viewport
        position: 'absolute'
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

        '&:not(.webchat__bubble--rtl)': {
          '&.webchat__bubble--hide-nub, &.webchat__bubble--show-nub': {
            '& .webchat__bubble__content': {
              marginLeft: paddingRegular
            }
          },

          '&.webchat__bubble--show-nub': {
            '& .webchat__bubble__content': {
              // Hide border radius if there is a nub on the top/bottom left corner
              ...(botNubUpSideDown ? { borderBottomLeftRadius: botNubCornerRadius } : {}),
              ...(!botNubUpSideDown ? { borderTopLeftRadius: botNubCornerRadius } : {})
            }
          },

          '& .webchat__bubble__nub': {
            left: bubbleBorderWidth - bubbleNubSize + paddingRegular
          }
        },

        '&.webchat__bubble--rtl': {
          '&.webchat__bubble--hide-nub, &.webchat__bubble--show-nub': {
            '& .webchat__bubble__content': {
              marginRight: paddingRegular
            }
          },

          '&.webchat__bubble--show-nub': {
            '& .webchat__bubble__content': {
              // Hide border radius if there is a nub on the top/bottom right corner
              ...(botNubUpSideDown ? { borderBottomRightRadius: botNubCornerRadius } : {}),
              ...(!botNubUpSideDown ? { borderTopRightRadius: botNubCornerRadius } : {})
            }
          },

          '& .webchat__bubble__nub': {
            right: bubbleBorderWidth - bubbleNubSize + paddingRegular,
            transform: 'scale(-1, 1)'
          }
        },

        '& .webchat__bubble__nub': {
          bottom: isZeroOrPositive(bubbleNubOffset) ? undefined : -bubbleNubOffset,
          height: bubbleNubSize,
          top: isZeroOrPositive(bubbleNubOffset) ? bubbleNubOffset : undefined,
          width: bubbleNubSize
        },

        '& .webchat__bubble__nub-outline': {
          fill: bubbleBackground,
          stroke: bubbleBorderColor,
          strokeWidth: bubbleBorderWidth
        }
      },

      '&.webchat__bubble--from-user': {
        '& .webchat__bubble__content': {
          background: bubbleFromUserBackground,
          borderColor: bubbleFromUserBorderColor,
          borderRadius: bubbleFromUserBorderRadius,
          borderStyle: bubbleFromUserBorderStyle,
          borderWidth: bubbleFromUserBorderWidth,
          color: bubbleFromUserTextColor,
          minHeight: bubbleMinHeight - bubbleFromUserBorderWidth * 2
        },

        '&:not(.webchat__bubble--rtl)': {
          '&.webchat__bubble--hide-nub, &.webchat__bubble--show-nub': {
            '& .webchat__bubble__content': {
              marginRight: paddingRegular
            }
          },

          '&.webchat__bubble--show-nub': {
            '& .webchat__bubble__content': {
              // Hide border radius if there is a nub on the top/bottom right corner
              ...(userNubUpSideDown ? { borderBottomRightRadius: userNubCornerRadius } : {}),
              ...(!userNubUpSideDown ? { borderTopRightRadius: userNubCornerRadius } : {})
            }
          },

          '& .webchat__bubble__nub': {
            right: bubbleFromUserBorderWidth - bubbleFromUserNubSize + paddingRegular
          }
        },

        '&.webchat__bubble--rtl': {
          '&.webchat__bubble--hide-nub, &.webchat__bubble--show-nub': {
            '& .webchat__bubble__content': {
              marginLeft: paddingRegular
            }
          },

          '&.webchat__bubble__has-nub': {
            '& .webchat__bubble__content': {
              // Hide border radius if there is a nub on the top/bottom left corner
              ...(userNubUpSideDown ? { borderBottomLeftRadius: userNubCornerRadius } : {}),
              ...(!userNubUpSideDown ? { borderTopLeftRadius: userNubCornerRadius } : {})
            }
          },

          '& .webchat__bubble__nub': {
            left: bubbleFromUserBorderWidth - bubbleFromUserNubSize + paddingRegular,
            transform: 'scale(-1, 1)'
          }
        },

        '& .webchat__bubble__nub': {
          height: bubbleFromUserNubSize,
          bottom: isZeroOrPositive(bubbleFromUserNubOffset) ? undefined : -bubbleFromUserNubOffset,
          top: isZeroOrPositive(bubbleFromUserNubOffset) ? bubbleFromUserNubOffset : undefined,
          width: bubbleFromUserNubSize
        },

        '& .webchat__bubble__nub-outline': {
          fill: bubbleFromUserBackground,
          stroke: bubbleFromUserBorderColor,
          strokeWidth: bubbleFromUserBorderWidth
        }
      }
    }
  };
}
