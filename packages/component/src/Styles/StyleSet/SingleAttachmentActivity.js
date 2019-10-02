export default function createSingleCardActivityStyle({ bubbleMaxWidth, bubbleMinWidth, paddingRegular }) {
  return {
    '& > .bubble-box': {
      maxWidth: bubbleMaxWidth,
      minWidth: bubbleMinWidth
    },

    '& > .filler': {
      minWidth: paddingRegular
    }
  };
}
