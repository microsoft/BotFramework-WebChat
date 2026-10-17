import CSSTokens from '../CSSTokens';

/**
 * @deprecated Not used for rendering since 4.19.0 (PR #5669), customizing it has no effect.
 * The live styles are in `packages/component/src/ActivityStatus/ActivityStatus.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createSendStatusStyle() {
  return {
    '&.webchat__activity-status': {
      color: CSSTokens.ColorTimestamp,
      fontFamily: CSSTokens.FontPrimary,
      fontSize: CSSTokens.FontSizeSmall,
      marginTop: `calc(${CSSTokens.PaddingRegular} / 2)`
    },

    '&.webchat__activity-status--slotted': {
      display: 'inline-flex',
      gap: 4
    },

    '& .webchat__activity-status-slot': {
      display: 'contents',

      '&:not(:first-child)::before': {
        content: `"|"`
      },

      '&:empty': {
        display: 'none'
      }
    },

    '& .webchat__activity-status__originator': {
      alignItems: 'center',

      '&.webchat__activity-status__originator--has-link': {
        color: CSSTokens.ColorAccent
      }
    }
  };
}
