import CSSTokens from '../CSSTokens';

export default function createCodeBlockCopyButtonStyle() {
  return {
    '&.webchat__code-block-copy-button': {
      alignItems: 'center',
      appearance: 'none',
      background: '#fff',
      borderRadius: '4px',
      border: '1px solid #d1d1d1',
      color: '#242424',
      display: 'grid',
      float: 'right', // Use "inline-end" after we update Chromium in Docker
      gap: '4px',
      justifyContent: 'center',
      marginInlineStart: CSSTokens.PaddingRegular,
      padding: '3px',

      '&:hover': {
        background: '#f5f5f5',
        border: '1px solid #c7c7c7',
        color: '#242424'
      },

      '&:active': {
        background: '#e0e0e0',
        border: '1px solid #b3b3b3',
        color: '#242424'
      },

      '&:focus-visible': {
        background: '#fff',
        outline: '2px solid #000',
        outlineOffset: '-2px'
      },

      '&[aria-disabled="true"]': {
        background: '#f0f0f0',
        border: '1px solid #e0e0e0',
        color: '#bdbdbd',
        cursor: 'not-allowed'
      },

      '& .webchat__code-block-copy-button__icon': {
        gridColumn: 1,
        gridRow: 1,

        '--webchat__component-icon--color': '#707070',
        '--webchat__component-icon--size': '16px'
      },

      '& .webchat__code-block-copy-button__icon--copied': {
        opacity: 0
      },

      '&.webchat__code-block-copy-button--copied .webchat__code-block-copy-button__icon': {
        animation: 'webchat__code-block-copy-button__copied-animation 0.5s linear'
      },

      '@keyframes webchat__code-block-copy-button__copied-animation': {
        '0%': {
          opacity: '100%'
        },

        '100%': {
          opacity: 'unset'
        }
      }
    }
  };
}
