export default function createSingleCardActivityStyle({
  bubbleMaxWidth,
  bubbleMinWidth
}) {
  return {
    '& > .bubble-box': {
      maxWidth: bubbleMaxWidth,
      minWidth: bubbleMinWidth
    },

    '& > .filler': {
      minWidth: 10
    }
  };
}
