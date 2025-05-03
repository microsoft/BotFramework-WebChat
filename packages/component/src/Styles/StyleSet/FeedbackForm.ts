import CSSTokens from '../CSSTokens';

export default function createFeedbackFormStyle() {
  return {
    '&.webchat__feedback-form__root-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    '.webchat__feedback-form__root-child': {
      display: 'flex'
    },
    '.webchat__feedback-form': {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      position: 'relative'
    },
    '.webchat__feedback-form__body': {
      fontFamily: CSSTokens.FontPrimary,
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: '#373435'
    },
    '.webchat__feedback-form__caption': {
      fontFamily: CSSTokens.FontPrimary,
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: '10px',
      lineHeight: '14px',
      color: CSSTokens.ColorSubtle
    },
    '.webchat__feedback-form__container': {
      display: 'flex',
      gap: '8px',
      marginTop: '6px'
    },
    '.webchat__feedback-form__submit-button': {
      backgroundColor: CSSTokens.ColorAccent,
      border: `1px solid ${CSSTokens.ColorAccent}`,
      borderRadius: '4px',
      color: '#FFFFFF',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: CSSTokens.FontPrimary,
      height: '24px',
      padding: '0 8px'
    },
    '.webchat__feedback-form__submit-button:hover': {
      backgroundColor: '#004a98',
      border: '1px solid #004a98',
      color: '#FFFFFF'
    },
    '.webchat__feedback-form__submit-button:active': {
      backgroundColor: '#004a98',
      border: '1px solid #004a98',
      color: '#FFFFFF'
    },
    '.webchat__feedback-form__cancel-button': {
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      border: '1px solid #E8E8E8',
      color: CSSTokens.ColorSubtle,
      fontFamily: CSSTokens.FontPrimary,
      height: '24px',
      padding: '0 8px'
    },
    '.webchat__feedback-form__cancel-button:hover': {
      backgroundColor: CSSTokens.ColorSubtle,
      color: '#FFFFFF'
    }
  };
}
