export default function createBubbleStyle({
  bubbleBackground,
  bubbleBorder,
  bubbleBorderRadius,
  bubbleMaxWidth,
  bubbleMinHeight
}) {
  return {
    background: bubbleBackground,
    border: bubbleBorder,
    borderRadius: bubbleBorderRadius,
    maxWidth: bubbleMaxWidth,
    minHeight: bubbleMinHeight
  };
}
