export default function createBubbleStyle({
  bubbleBackground,
  bubbleBorder,
  bubbleBorderRadius,
  bubbleMaxWidth
}) {
  return {
    background: bubbleBackground,
    border: bubbleBorder,
    borderRadius: bubbleBorderRadius,
    maxWidth: bubbleMaxWidth,
    minHeight: 40
  };
}
