export default function createBubbleStyle({
  bubbleBackground,
  bubbleBorder,
  bubbleBorderRadius,
  bubbleFromUserBackground,
  bubbleFromUserBorder,
  bubbleFromUserBorderRadius,
  bubbleFromUserTextColor,
  bubbleMaxWidth,
  bubbleMinHeight,
  bubbleTextColor
}) {
  return {
    maxWidth: bubbleMaxWidth,
    minHeight: bubbleMinHeight,

    '&:not(.from-user)': {
      background: bubbleBackground,
      border: bubbleBorder,
      borderRadius: bubbleBorderRadius,
      color: bubbleTextColor
    },

    '&.from-user': {
      background: bubbleFromUserBackground,
      border: bubbleFromUserBorder,
      borderRadius: bubbleFromUserBorderRadius,
      color: bubbleFromUserTextColor
    }
  };
}
