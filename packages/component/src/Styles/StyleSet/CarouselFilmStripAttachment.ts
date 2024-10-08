/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */
import { StrictStyleOptions } from 'botframework-webchat-api';

import CSSTokens from '../CSSTokens';
import mirrorStyle from '../mirrorStyle';

export default function CarouselFilmStripAttachment({
  avatarSize,
  paddingRegular,
  transcriptVisualKeyboardIndicatorColor,
  transcriptVisualKeyboardIndicatorStyle,
  transcriptVisualKeyboardIndicatorWidth,
  transitionDuration
}: StrictStyleOptions) {
  return {
    '&.webchat__carousel-filmstrip-attachment': {
      maxWidth: CSSTokens.MaxWidthAttachmentBubble,
      minWidth: CSSTokens.MinWidthAttachmentBubble,
      transitionDuration,
      transitionProperty: 'max-width, min-width',

      '&:focus': {
        outline: 0
      },

      '&:focus .webchat__carousel-filmstrip-attachment--focus': {
        borderColor: transcriptVisualKeyboardIndicatorColor,
        borderStyle: transcriptVisualKeyboardIndicatorStyle,
        borderWidth: transcriptVisualKeyboardIndicatorWidth,
        boxSizing: 'border-box',
        height: `calc(100% - ${transcriptVisualKeyboardIndicatorWidth}px)`,
        left: 0,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        width: `calc(100% - ${transcriptVisualKeyboardIndicatorWidth}px)`
      }
    },
    ...mirrorStyle('&.webchat__carousel-filmstrip-attachment--rtl', {
      paddingLeft: paddingRegular,

      '&.webchat__carousel-filmstrip-attachment--hide-avatar, &.webchat__carousel-filmstrip-attachment--show-avatar': {
        '&:first-child': {
          paddingLeft: avatarSize + paddingRegular * 2
        }
      },

      '&.webchat__carousel-filmstrip-attachment--hide-nub, &.webchat__carousel-filmstrip-attachment--show-nub': {
        '&:not(.webchat__carousel-filmstrip-attachment--hide-avatar.webchat__carousel-filmstrip-attachment--show-avatar):first-child':
          {
            paddingLeft: paddingRegular * 2
          }
      }
    })
  };
}
