export default function createBubbleStyle({
  bubbleBackground,
  bubbleBorder,
  bubbleBorderRadius,
}) {
  return {
    background: bubbleBackground,
    border: bubbleBorder,
    borderRadius: bubbleBorderRadius,

    '& > .content': {
      minHeight: 20,
      padding: 10
    }
  };
}
