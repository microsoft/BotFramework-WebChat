import CSSTokens from '../CSSTokens';

export default function createTextContentStyle() {
  return {
    '&.webchat__text-content': {
      fontFamily: CSSTokens.FontPrimary,
      margin: 0,
      minHeight: `calc(${CSSTokens.MinHeightBubble} - ${CSSTokens.PaddingRegular} * 2)`,
      padding: CSSTokens.PaddingRegular,

      '&.webchat__text-content--is-markdown': {
        display: 'flex',
        flexDirection: 'column',
        gap: CSSTokens.PaddingRegular
      },

      '& .webchat__text-content__markdown img:not(.webchat__render-markdown__external-link-icon)': {
        maxWidth: CSSTokens.MaxWidthMessageBubble,
        minWidth: CSSTokens.MinWidthMessageBubble,
        width: '100%'
      },

      '& .webchat__text-content__markdown pre': {
        overflow: 'hidden'
      },

      '& .webchat__text-content__open-in-new-window-icon': {
        height: '.75em'
      },

      '& .webchat__text-content__activity-actions': {
        alignSelf: 'flex-start',
        display: 'flex',
        gap: `calc(${CSSTokens.PaddingRegular} / 2)`
      },

      '& .webchat__text-content__activity-actions:empty': {
        display: 'none'
      }
    }
  };
}
