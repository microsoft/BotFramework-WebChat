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
      lineHeight: '20px',
      color: CSSTokens.FeedbackFormTitleColor
    },
    '&.feedback-form__caption1': {
      fontFamily: CSSTokens.FontPrimary,
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: '10px',
      lineHeight: '14px',
      color: CSSTokens.FeedbackFormDisclaimerColor
    },
    '&.feedback-form__container': {
      display: 'flex',
      flexDirection: 'row',
      gap: '8px'
    },
    '&.feedback-form__button__submit': {
      backgroundColor: CSSTokens.FeedbackFormSubmitButtonColor,
      border: `1px solid ${CSSTokens.FeedbackFormSubmitButtonColor}`,
      borderRadius: '4px',
      color: CSSTokens.FeedbackFormSubmitButtonFontColor,
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: CSSTokens.FontPrimary
    },
    '&.feedback-form__button__submit:hover': {
      backgroundColor: CSSTokens.FeedbackFormSubmitButtonHoverColor
    },
    '&.feedback-form__button__submit:active': {
      backgroundColor: CSSTokens.FeedbackFormSubmitButtonActiveColor
    },
    '&.feedback-form__button__submit:disabled': {
      backgroundColor: CSSTokens.FeedbackFormSubmitButtonDisabledColor,
      cursor: 'not-allowed'
    },
    '&.feedback-form__button__cancel': {
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      border: `1px solid ${CSSTokens.FeedbackFormCancelButtonBorderColor}`,
      fontFamily: CSSTokens.FontPrimary
    },
    '&.feedback-form__button__cancel:hover': {
      backgroundColor: CSSTokens.FeedbackFormCancelButtonHoverColor
    }
  };
}
