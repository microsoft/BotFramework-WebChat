import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createSingleCardActivityStyle({
  bubbleMaxWidth,
  bubbleMinWidth,
  paddingRegular
}: StrictStyleOptions) {
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
