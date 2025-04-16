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
      gap: '8px',
      paddingTop: '6px'
    },
    '&.feedback-form__button__submit': {
      backgroundColor: CSSTokens.FeedbackFormSubmitButtonColor,
      border: `1px solid ${CSSTokens.FeedbackFormSubmitButtonBorderColor}`,
      borderRadius: '4px',
      color: CSSTokens.FeedbackFormSubmitButtonFontColor,
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: CSSTokens.FontPrimary,
      height: '24px',
      padding: '0 8px'
    },
    '&.feedback-form__button__submit:hover': {
      backgroundColor: CSSTokens.FeedbackFormSubmitButtonHoverColor,
      border: `1px solid ${CSSTokens.FeedbackFormSubmitButtonHoverColor}`,
      color: CSSTokens.FeedbackFormSubmitButtonFontColorOnHover
    },
    '&.feedback-form__button__submit:active': {
      backgroundColor: CSSTokens.FeedbackFormSubmitButtonActiveColor
    },
    '&.feedback-form__button__submit:disabled': {
      backgroundColor: CSSTokens.FeedbackFormSubmitButtonDisabledColor,
      color: CSSTokens.FeedbackFormSubmitButtonFontColorOnDisabled,
      cursor: 'not-allowed'
    },
    '&.feedback-form__button__cancel': {
      backgroundColor: CSSTokens.FeedbackFormCancelButtonColor,
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      border: `1px solid ${CSSTokens.FeedbackFormCancelButtonBorderColor}`,
      color: CSSTokens.FeedbackFormCancelButtonFontColor,
      fontFamily: CSSTokens.FontPrimary,
      height: '24px',
      padding: '0 8px'
    },
    '&.feedback-form__button__cancel:hover': {
      backgroundColor: CSSTokens.FeedbackFormCancelButtonHoverColor,
      color: CSSTokens.FeedbackFormCancelButtonFontColorOnHover
    }
  };
}
