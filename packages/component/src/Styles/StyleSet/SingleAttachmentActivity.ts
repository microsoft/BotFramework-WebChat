import type { StrictStyleOptions } from 'botframework-webchat-api';

import CSSTokens from '../CSSTokens';

export default function createSingleCardActivityStyle({ paddingRegular }: StrictStyleOptions) {
  return {
    '& > .bubble-box': {
      maxWidth: CSSTokens.MaxWidthBubble,
      minWidth: CSSTokens.MinWidthBubble
    },

    '& > .filler': {
      minWidth: paddingRegular
    }
  };
}
