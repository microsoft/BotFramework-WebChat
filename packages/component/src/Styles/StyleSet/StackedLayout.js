/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import mirrorStyle from '../mirrorStyle';

export default function createStackedLayoutStyle({
  avatarSize,
  bubbleMaxWidth,
  bubbleMinWidth,
  paddingRegular,
  transitionDuration
}) {
  return {
    '&.webchat__stacked-layout': {
      marginLeft: paddingRegular,
      marginRight: paddingRegular,

      '& .webchat__stacked-layout__alignment-pad': {
        transitionDuration,
        transitionProperty: 'width',
        width: 0
      },

      '&.webchat__stacked-layout--extra-trailing': {
        '& .webchat__stacked-layout__alignment-pad': {
          width: paddingRegular
        }
      },

      // Revised

      '&.webchat__stacked-layout--from-user': {
        '& .webchat__stacked-layout__main, .webchat__stacked-layout__status': {
          flexDirection: 'row-reverse'
        }
      },

      '& .webchat__stacked-layout__avatar-gutter': {
        transitionDuration,
        transitionProperty: 'width',
        width: 0
      },

      '& .webchat__stacked-layout__bubble': {
        maxWidth: bubbleMaxWidth,
        minWidth: bubbleMinWidth,
        transitionDuration,
        transitionProperty: 'max-width, min-width'
      },

      // nub-pad

      '& .webchat__stacked-layout__nub-pad': {
        transitionDuration,
        transitionProperty: 'width',
        width: 0
      },

      '&.webchat__stacked-layout--hide-avatar, &.webchat__stacked-layout--show-avatar': {
        '& .webchat__stacked-layout__avatar-gutter': {
          width: avatarSize
        }
      },

      '&.webchat__stacked-layout--hide-avatar, &.webchat__stacked-layout--show-avatar, &.webchat__stacked-layout--hide-nub, &.webchat__stacked-layout--show-nub': {
        '& .webchat__stacked-layout__bubble': {
          maxWidth: bubbleMaxWidth + paddingRegular
        },

        '& .webchat__stacked-layout__nub-pad': {
          width: paddingRegular
        }
      },

      '&:not(.webchat__stacked-layout--top-callout) .webchat__stacked-layout__avatar-gutter': {
        justifyContent: 'flex-end'
      },

      // attachment

      '& .webchat__stacked-layout__attachment': {
        marginTop: paddingRegular
      }
    }
  };
}
