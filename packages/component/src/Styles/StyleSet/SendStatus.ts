import CSSTokens from '../CSSTokens';

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

    '& .webchat__activity-status__originator': {
      alignItems: 'center',

      '&.webchat__activity-status__originator--has-link': {
        color: CSSTokens.ColorAccent
      }
    }
  };
}
