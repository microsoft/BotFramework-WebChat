// import CSSTokens from '../CSSTokens';
// import { FORCED_COLORS_SELECTOR, NOT_FORCED_COLORS_SELECTOR } from './Constants';

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
      float: 'right',
      gap: '4px',
      justifyContent: 'center',
      padding: '5px 5px',

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

      '--webchat__code-block-copy-button--icon-url': `url(data:image/svg+xml;utf8,${encodeURIComponent('<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2C6.89543 2 6 2.89543 6 4V14C6 15.1046 6.89543 16 8 16H14C15.1046 16 16 15.1046 16 14V4C16 2.89543 15.1046 2 14 2H8ZM7 4C7 3.44772 7.44772 3 8 3H14C14.5523 3 15 3.44772 15 4V14C15 14.5523 14.5523 15 14 15H8C7.44772 15 7 14.5523 7 14V4ZM4 6.00001C4 5.25973 4.4022 4.61339 5 4.26758V14.5C5 15.8807 6.11929 17 7.5 17H13.7324C13.3866 17.5978 12.7403 18 12 18H7.5C5.567 18 4 16.433 4 14.5V6.00001Z" fill="#000000"/></svg>')})`,

      '&.webchat__code-block-copy-button--copied': {
        '--webchat__code-block-copy-button--icon-url': `url(data:image/svg+xml;utf8,${encodeURIComponent('<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.37371 10.1678C3.19025 9.96143 2.87421 9.94284 2.66782 10.1263C2.46143 10.3098 2.44284 10.6258 2.6263 10.8322L6.6263 15.3322C6.81743 15.5472 7.15013 15.557 7.35356 15.3536L17.8536 4.85355C18.0488 4.65829 18.0488 4.34171 17.8536 4.14645C17.6583 3.95118 17.3417 3.95118 17.1465 4.14645L7.02141 14.2715L3.37371 10.1678Z" fill="#000000"/></svg>')})`
      },

      '& .webchat__code-block-copy-button__icon': {
        backgroundColor: '#707070',
        height: '20px',
        gridColumn: 1,
        gridRow: 1,
        maskImage: 'var(--webchat__code-block-copy-button--icon-url)',
        maskRepeat: 'no-repeat',
        WebkitMaskImage: 'var(--webchat__code-block-copy-button--icon-url)',
        WebkitMaskRepeat: 'no-repeat',
        width: '20px'
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
