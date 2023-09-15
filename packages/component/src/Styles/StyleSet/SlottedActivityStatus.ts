import CSSTokens from '../CSSTokens';

export default function createSlottedActivityStatus() {
  return {
    '&.webchat__slotted-activity-status': {
      alignItems: 'center',
      display: 'inline-flex',
      gap: 4,
      marginTop: `calc(${CSSTokens.PaddingRegular} / 2)`,

      '& .webchat__slotted-activity-status__pipe': {
        fontSize: CSSTokens.FontSizeSmall
      }
    }
  };
}
