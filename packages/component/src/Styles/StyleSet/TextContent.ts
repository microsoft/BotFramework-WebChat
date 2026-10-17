import CSSTokens from '../CSSTokens';

/**
 * @deprecated Not used for rendering since 4.19.0 (PR #5670), customizing it has no effect.
 * The live styles are in `packages/component/src/Attachment/Text/TextContent.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
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
        justifyContent: 'center',
        gap: CSSTokens.PaddingRegular,
        minWidth: 0
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
        flexWrap: 'wrap',
        gap: `8px calc(${CSSTokens.PaddingRegular} / 2)`,
        width: '100%'
      },

      '& .webchat__text-content__activity-actions:empty': {
        display: 'none'
      }
    }
  };
}
