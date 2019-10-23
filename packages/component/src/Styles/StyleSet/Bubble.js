/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */

function isPositive(value) {
  return 1 / value >= 0;
}

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
  paddingRegular
}) {
  const botNubUpSideDown = !isPositive(bubbleNubOffset);
  const userNubUpSideDown = !isPositive(bubbleFromUserNubOffset);

  const botNubCornerRadius = Math.min(bubbleBorderRadius, Math.abs(bubbleNubOffset));
  const userNubCornerRadius = Math.min(bubbleFromUserBorderRadius, Math.abs(bubbleFromUserNubOffset));

  return {
    '& > .webchat__bubble__content': {
      wordBreak: messageActivityWordBreak
    },

    '& > .webchat__bubble__nub': {
      overflow: 'hidden', // This style is for IE11 because it don't respect SVG viewport
      position: 'absolute'
    },

    '&:not(.from-user)': {
      '&.webchat__bubble_has_nub': {
        '& > .webchat__bubble__content': bubbleNubSize ? { marginLeft: paddingRegular } : {}
      },

      '& > .webchat__bubble__content': {
        background: bubbleBackground,
        borderColor: bubbleBorderColor,
        borderRadius: bubbleBorderRadius,
        borderStyle: bubbleBorderStyle,
        borderWidth: bubbleBorderWidth,
        color: bubbleTextColor,
        minHeight: bubbleMinHeight - bubbleBorderWidth * 2
      },

      '&.webchat__bubble_has_nub > .webchat__bubble__content': {
        // Hide border radius if there is a nub on the top/bottom left corner
        ...(bubbleNubSize && botNubUpSideDown ? { borderBottomLeftRadius: botNubCornerRadius } : {}),
        ...(bubbleNubSize && !botNubUpSideDown ? { borderTopLeftRadius: botNubCornerRadius } : {})
      },

      '& > .webchat__bubble__nub': {
        bottom: isPositive(bubbleNubOffset) ? undefined : -bubbleNubOffset,
        height: bubbleNubSize,
        left: bubbleBorderWidth - bubbleNubSize + paddingRegular,
        top: isPositive(bubbleNubOffset) ? bubbleNubOffset : undefined,
        width: bubbleNubSize,

        '& > g > path': {
          fill: bubbleBackground,
          stroke: bubbleBorderColor,
          strokeWidth: bubbleBorderWidth
        }
      }
    },

    '&.from-user': {
      '&.webchat__bubble_has_nub': {
        '& > .webchat__bubble__content': bubbleNubSize ? { marginRight: paddingRegular } : {}
      },

      '& > .webchat__bubble__content': {
        background: bubbleFromUserBackground,
        borderColor: bubbleFromUserBorderColor,
        borderRadius: bubbleFromUserBorderRadius,
        borderStyle: bubbleFromUserBorderStyle,
        borderWidth: bubbleFromUserBorderWidth,
        color: bubbleFromUserTextColor,
        minHeight: bubbleMinHeight - bubbleFromUserBorderWidth * 2
      },

      '&.webchat__bubble_has_nub > .webchat__bubble__content': {
        // Hide border radius if there is a nub on the top/bottom right corner
        ...(bubbleFromUserNubSize && userNubUpSideDown ? { borderBottomRightRadius: userNubCornerRadius } : {}),
        ...(bubbleFromUserNubSize && !userNubUpSideDown ? { borderTopRightRadius: userNubCornerRadius } : {})
      },

      '& > .webchat__bubble__nub': {
        height: bubbleFromUserNubSize,
        right: bubbleFromUserBorderWidth - bubbleFromUserNubSize + paddingRegular,
        bottom: isPositive(bubbleFromUserNubOffset) ? undefined : -bubbleFromUserNubOffset,
        top: isPositive(bubbleFromUserNubOffset) ? bubbleFromUserNubOffset : undefined,
        width: bubbleFromUserNubSize,

        '& > g > path': {
          fill: bubbleFromUserBackground,
          stroke: bubbleFromUserBorderColor,
          strokeWidth: bubbleFromUserBorderWidth
        }
      }
    }
  };
}
