import CSSTokens from '../CSSTokens';

export default function createViewCodeDialogStyle() {
  return {
    '&.webchat__view-code-dialog': {
      boxSizing: 'border-box',
      display: 'grid',
      height: '100%',
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
        gap: CSSTokens.PaddingRegular,
        overflow: 'hidden'
      },

      '& .webchat__view-code-dialog__header': {
        alignItems: 'center',
        display: 'flex',
        paddingInlineEnd: '30px'
      },

      '& .webchat__view-code-dialog__title': {
        margin: '0 auto 0 0',
        textTransform: 'capitalize'
      },

      '& .webchat__view-code-dialog__body': {
        border: 'none',
        borderRadius: 0,
        display: 'flex',
        overflow: 'auto',
        height: '100%',

        '.webchat__code-block__body': {
          margin: 0,
          padding: '16px 0'
        }
      },

      '& .webchat__view-code-dialog__footer': {
        color: CSSTokens.ColorSubtle,
        lineHeight: '20px'
      },

      '& .webchat__view-code-dialog__copy-button': {
        position: 'absolute',
        right: '10px',
        top: '10px'
      }
    }
  };
}
