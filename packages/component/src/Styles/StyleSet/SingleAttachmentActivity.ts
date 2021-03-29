import { StyleOptions } from 'botframework-webchat-api';

export default function createSingleCardActivityStyle({
  bubbleMaxWidth,
  bubbleMinWidth,
  paddingRegular
}: StyleOptions) {
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
