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
      color: CSSTokens.FeedbackFormNeutralDark
    },
    '&.feedback-form__caption1': {
      fontFamily: CSSTokens.FontPrimary,
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: '10px',
      lineHeight: '14px',
      color: CSSTokens.FeedbackFormNeutralMedium
    },
    '&.feedback-form__container': {
      display: 'flex',
      flexDirection: 'row',
      gap: '8px',
      paddingTop: '6px'
    },
    '&.feedback-form__button__submit': {
      backgroundColor: CSSTokens.FeedbackFormPrimary,
      border: `1px solid ${CSSTokens.FeedbackFormPrimary}`,
      borderRadius: '4px',
      color: CSSTokens.FeedbackFormLightest,
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: CSSTokens.FontPrimary,
      height: '24px',
      padding: '0 8px'
    },
    '&.feedback-form__button__submit:hover': {
      backgroundColor: CSSTokens.FeedbackFormPrimarySubmitted,
      border: `1px solid ${CSSTokens.FeedbackFormPrimarySubmitted}`,
      color: CSSTokens.FeedbackFormLightest
    },
    '&.feedback-form__button__submit:active': {
      backgroundColor: CSSTokens.FeedbackFormPrimarySubmitted,
      border: `1px solid ${CSSTokens.FeedbackFormPrimarySubmitted}`,
      color: CSSTokens.FeedbackFormLightest
    },
    '&.feedback-form__button__cancel': {
      backgroundColor: CSSTokens.FeedbackFormLightest,
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      border: `1px solid ${CSSTokens.FeedbackFormNeutralLight}`,
      color: CSSTokens.FeedbackFormNeutralMedium,
      fontFamily: CSSTokens.FontPrimary,
      height: '24px',
      padding: '0 8px'
    },
    '&.feedback-form__button__cancel:hover': {
      backgroundColor: CSSTokens.FeedbackFormNeutralMedium,
      color: CSSTokens.FeedbackFormLightest
    }
  };
}
