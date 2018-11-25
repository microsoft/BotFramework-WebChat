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
    transition: 'border .3s ease-in-out',

    '&:hover': {
        border: '1px solid #77d6f5',
        boxShadow: 'inset 0 0 2px 0 rgba(0,0,0,.2)'
    },

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
