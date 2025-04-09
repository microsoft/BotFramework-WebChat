import CSSTokens from '../CSSTokens';

export default function createFeedbackFormStyle() {
  return {
    '&.feedback-form': {
      boxSizing: 'border-box',
      display: 'grid',
      gap: '4px',
      gridTemplateRows: 'auto auto',
      position: 'relative'
    },
    '&.feedback-form__body1': {
      fontFamily: CSSTokens.FontPrimary,
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px'
    },
    '&.feedback-form__caption1': {
      fontFamily: CSSTokens.FontPrimary,
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: '10px',
      lineHeight: '14px',
      color: '#616161'
    },
    '&.feedback-form__container': {
      display: 'flex',
      flexDirection: 'row',
      gap: '8px'
    },
    '&.feedback-form__button__submit': {
      backgroundColor: CSSTokens.ColorAccent,
      border: `1px solid ${CSSTokens.ColorAccent}`,
      borderRadius: '4px',
      color: '#ffffff',
      cursor: 'pointer',
      fontSize: '14px',
      lineHeight: '14px',
      fontFamily: CSSTokens.FontPrimary
    },
    '&.feedback-form__button__cancel': {
      backgroundColor: 'white',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      lineHeight: '14px',
      border: `1px solid ${CSSTokens.ColorSubtle}`,
      fontFamily: CSSTokens.FontPrimary
    },
    '&.sendbox__sendbox': {
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      border: `1px solid ${CSSTokens.ColorSubtle}`,
      display: 'grid',
      fontFamily: CSSTokens.FontPrimary,
      fontSize: '14px',
      gap: '6px',
      lineHeight: '20px',
      padding: '8px',
      position: 'relative',
      width: CSSTokens.MinWidthAttachmentBubble,
      height: CSSTokens.MinHeightBubble
    }
  };
}
