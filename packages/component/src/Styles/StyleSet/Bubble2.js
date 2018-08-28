export default function createBubbleStyle({
  bubbleBackground,
  bubbleMaxWidth
}) {
  return {
    background: bubbleBackground,
    maxWidth: bubbleMaxWidth,
    minHeight: 40
  };
}
