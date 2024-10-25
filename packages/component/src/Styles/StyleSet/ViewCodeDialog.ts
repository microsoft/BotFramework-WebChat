import CSSTokens from '../CSSTokens';

export default function createViewCodeDialogStyle() {
  return {
    '&.webchat__view-code-dialog': {
      boxSizing: 'border-box',
      display: 'grid',
      height: '100%',
      margin: 0,
      maxHeight: '100vh',
      overflow: 'hidden',
      padding: '1rem',
      placeItems: 'center',

      '& .webchat__modal-dialog__box': {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        maxWidth: '100%',
        position: 'relative'
      },

      '& .webchat__modal-dialog__close-button-layout': {
        position: 'absolute',
        right: 0
      },

      '& .webchat__modal-dialog__body': {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        gap: CSSTokens.PaddingRegular
      },

      '& .webchat__view-code-dialog__header': {
        display: 'flex',
        paddingInlineEnd: '30px'
      },

      '& .webchat__view-code-dialog__title': {
        margin: '0 auto 0 0',
        textTransform: 'capitalize'
      },

      '& .webchat__view-code-dialog__body': {
        lineHeight: '20px',
        overflow: 'auto'
      },

      '& .webchat__view-code-dialog__footer': {
        color: CSSTokens.ColorSubtle,
        lineHeight: '20px'
      }
    }
  };
}
