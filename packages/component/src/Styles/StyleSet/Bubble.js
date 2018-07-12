export default function createBubbleStyle({
  bubbleBackground
}) {
  return {
    background: bubbleBackground,

    '& > .content': {
      minHeight: 20,
      padding: 10
    }
  };
}
