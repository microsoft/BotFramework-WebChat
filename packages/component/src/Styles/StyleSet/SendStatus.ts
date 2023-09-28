import CSSTokens from '../CSSTokens';

export default function createSendStatusStyle() {
  return {
    '&.webchat__activity-status': {
      color: CSSTokens.ColorTimestamp,
      fontFamily: CSSTokens.FontPrimary,
      fontSize: CSSTokens.FontSizeSmall,
      marginTop: `calc(${CSSTokens.PaddingRegular} / 2)`,
      maxWidth: '100%'
    },

    '&.webchat__activity-status--slotted': {
      display: 'inline-flex',
      gap: 4
    },

    '& .webchat__activity-status__originator': {
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',

      '&.webchat__activity-status__originator--has-link': {
        color: CSSTokens.ColorAccent
      }
    }
  };
}
