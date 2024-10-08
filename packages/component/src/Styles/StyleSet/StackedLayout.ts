/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import { StrictStyleOptions } from 'botframework-webchat-api';
import CSSTokens from '../CSSTokens';

export default function createStackedLayoutStyle({
  bubbleMaxWidth,
  paddingRegular,
  transitionDuration
}: StrictStyleOptions) {
  return {
    '&.webchat__stacked-layout': {
      marginLeft: paddingRegular,
      marginRight: paddingRegular,

      '& .webchat__stacked-layout__alignment-pad': {
        transitionDuration,
        transitionProperty: 'width',
        width: 0
      },

      '&.webchat__stacked-layout--extra-trailing .webchat__stacked-layout__alignment-pad': {
        width: paddingRegular
      },

      '& .webchat__stacked-layout__avatar-gutter': {
        transitionDuration,
        transitionProperty: 'width',
        width: 0
      },

      '& .webchat__stacked-layout__attachment': {
        maxWidth: CSSTokens.MaxWidthBubble,
        minWidth: CSSTokens.MinWidthBubble,
        transitionDuration,
        transitionProperty: 'max-width, min-width'
      },

      '& .webchat__stacked-layout__attachment-row': {
        marginTop: paddingRegular,
        width: '100%'
      },

      '&.webchat__stacked-layout--no-message .webchat__stacked-layout__attachment-row.webchat__stacked-layout__attachment-row--first':
        {
          marginTop: 0
        },

      '& .webchat__stacked-layout__message': {
        maxWidth: CSSTokens.MaxWidthBubble,
        overflow: 'hidden',
        transitionDuration,
        transitionProperty: 'max-width'
      },

      '& .webchat__stacked-layout__nub-pad': {
        transitionDuration,
        transitionProperty: 'width',
        width: 0
      },

      '&.webchat__stacked-layout--hide-avatar, &.webchat__stacked-layout--show-avatar': {
        '& .webchat__stacked-layout__avatar-gutter': {
          width: CSSTokens.SizeAvatar
        }
      },

      '&.webchat__stacked-layout--hide-avatar, &.webchat__stacked-layout--show-avatar, &.webchat__stacked-layout--hide-nub, &.webchat__stacked-layout--show-nub':
        {
          '& .webchat__stacked-layout__attachment, & .webchat__stacked-layout__message': {
            maxWidth: bubbleMaxWidth + paddingRegular
          },

          '& .webchat__stacked-layout__nub-pad': {
            width: paddingRegular
          }
        },

      '&:not(.webchat__stacked-layout--top-callout)': {
        '& .webchat__stacked-layout__avatar-gutter, & .webchat__stacked-layout__content': {
          justifyContent: 'flex-end'
        }
      }
    }
  };
}
