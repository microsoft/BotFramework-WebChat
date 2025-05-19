import CSSTokens from '../CSSTokens';

export default function createFeedbackFormStyle() {
  return {
    '&.webchat__feedback-form': {
      display: 'contents',

      '& .webchat__feedback-form__vote-button-bar': {
        display: 'flex',
        gap: '2px'
      },

      '& .webchat__feedback-form__form': {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        position: 'relative',
        // The form should take the full width of the flex container width.
        width: '100%'
      },

      // TODO: Need review.
      '& .webchat__feedback-form__form-header': {
        color: '#373435',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: CSSTokens.FontPrimary,
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: '20px'
      },

      // TODO: Need review.
      '& .webchat__feedback-form__form-footer': {
        color: CSSTokens.ColorSubtle,
        fontFamily: CSSTokens.FontPrimary,
        fontSize: '10px',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: '14px'
      },

      '& .webchat__feedback-form__submission-button-bar': {
        display: 'flex',
        gap: '8px',
        marginTop: '6px'
      },

      // TODO: Need review.
      '& .webchat__feedback-form__submit-button': {
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

      // TODO: Need review.
      '& .webchat__feedback-form__submit-button:hover': {
        backgroundColor: '#004a98',
        border: '1px solid #004a98',
        color: '#FFFFFF'
      },

      // TODO: Need review.
      '& .webchat__feedback-form__submit-button:active': {
        backgroundColor: '#004a98',
        border: '1px solid #004a98',
        color: '#FFFFFF'
      },

      // TODO: Need review.
      '& .webchat__feedback-form__cancel-button': {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E8E8E8',
        borderRadius: '4px',
        color: CSSTokens.ColorSubtle,
        cursor: 'pointer',
        fontFamily: CSSTokens.FontPrimary,
        fontSize: '12px',
        height: '24px',
        padding: '0 8px'
      },

      // TODO: Need review.
      '& .webchat__feedback-form__cancel-button:hover': {
        backgroundColor: CSSTokens.ColorSubtle,
        color: 'White'
      }
    }
  };
}
