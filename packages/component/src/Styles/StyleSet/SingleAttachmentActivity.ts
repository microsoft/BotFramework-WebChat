import CSSTokens from '../CSSTokens';

export default function createSingleCardActivityStyle() {
  return {
    '& > .bubble-box': {
      maxWidth: CSSTokens.MaxWidthBubble,
      minWidth: CSSTokens.MinWidthBubble
    },

    '& > .filler': {
      minWidth: CSSTokens.PaddingRegular
    }
  };
}
