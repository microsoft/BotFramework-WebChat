import CSSTokens from '../CSSTokens';

export default function createCodeBlockCopyButtonStyle() {
  return {
    '&.webchat__code-block-copy-button': {
      '--webchat__code-block-copy-button--icon-url': `url(data:image/svg+xml;utf8,${encodeURIComponent('<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.08535 2C5.29127 1.4174 5.84689 1 6.5 1H9.5C10.1531 1 10.7087 1.4174 10.9146 2H11.5C12.3284 2 13 2.67157 13 3.5V7.49561C12.8322 7.49553 12.664 7.52345 12.503 7.57995C12.528 7.11911 12.3372 6.67672 12 6.37739V3.5C12 3.22386 11.7761 3 11.5 3H10.9146C10.7087 3.5826 10.1531 4 9.5 4H6.5C5.84689 4 5.29127 3.5826 5.08535 3H4.5C4.22386 3 4 3.22386 4 3.5V13.5C4 13.7761 4.22386 14 4.5 14H7.58766L7.56249 14.0881C7.47349 14.3996 7.48984 14.7162 7.59039 15H4.5C3.67157 15 3 14.3284 3 13.5V3.5C3 2.67157 3.67157 2 4.5 2H5.08535ZM6.5 2C6.22386 2 6 2.22386 6 2.5C6 2.77614 6.22386 3 6.5 3H9.5C9.77614 3 10 2.77614 10 2.5C10 2.22386 9.77614 2 9.5 2H6.5ZM9.36987 14.8419C9.28002 14.9377 9.15458 14.9956 9.02143 15C9.01081 15.0003 8.99972 15.0003 8.98902 15C8.94885 14.9987 8.90781 14.9924 8.86742 14.9809C8.83423 14.9714 8.80279 14.9588 8.77332 14.9435C8.67226 14.8908 8.59445 14.8061 8.54918 14.7061C8.50203 14.602 8.49015 14.4813 8.52401 14.3628L10.524 7.36277C10.5999 7.09725 10.8766 6.9435 11.1421 7.01937C11.4076 7.09523 11.5614 7.37197 11.4855 7.63749L9.48553 14.6375C9.46293 14.7166 9.42251 14.7858 9.36987 14.8419ZM7.37963 9.32101C7.55934 9.11135 7.53506 8.7957 7.3254 8.61599C7.11573 8.43628 6.80008 8.46056 6.62037 8.67022L5.12037 10.4202C4.95988 10.6075 4.95988 10.8838 5.12037 11.071L6.62037 12.821C6.80008 13.0307 7.11573 13.055 7.3254 12.8752C7.53506 12.6955 7.55934 12.3799 7.37963 12.1702L6.15854 10.7456L7.37963 9.32101ZM12.6746 12.8753C12.4649 12.6956 12.4407 12.3799 12.6204 12.1703L13.8415 10.7457L12.6204 9.32105C12.4407 9.11139 12.4649 8.79574 12.6746 8.61603C12.8843 8.43632 13.1999 8.4606 13.3796 8.67026L14.8796 10.4203C15.0401 10.6075 15.0401 10.8838 14.8796 11.0711L13.3796 12.8211C13.1999 13.0307 12.8843 13.055 12.6746 12.8753Z" fill="#000000"/></svg>')})`,
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

      '&.webchat__code-block-copy-button--copied': {
        '--webchat__code-block-copy-button--icon-url': `url(data:image/svg+xml;utf8,${encodeURIComponent('<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.08535 2C5.29127 1.4174 5.84689 1 6.5 1H9.5C10.1531 1 10.7087 1.4174 10.9146 2H11.5C12.3284 2 13 2.67157 13 3.5V6.20703C12.6777 6.11588 12.3434 6.05337 12 6.02242V3.5C12 3.22386 11.7761 3 11.5 3H10.9146C10.7087 3.5826 10.1531 4 9.5 4H6.5C5.84689 4 5.29127 3.5826 5.08535 3H4.5C4.22386 3 4 3.22386 4 3.5V13.5C4 13.7761 4.22386 14 4.5 14H6.59971C6.78261 14.3578 7.00353 14.6929 7.25716 15H4.5C3.67157 15 3 14.3284 3 13.5V3.5C3 2.67157 3.67157 2 4.5 2H5.08535ZM6.5 2C6.22386 2 6 2.22386 6 2.5C6 2.77614 6.22386 3 6.5 3H9.5C9.77614 3 10 2.77614 10 2.5C10 2.22386 9.77614 2 9.5 2H6.5ZM16 11.5C16 13.9853 13.9853 16 11.5 16C9.01472 16 7 13.9853 7 11.5C7 9.01472 9.01472 7 11.5 7C13.9853 7 16 9.01472 16 11.5ZM13.8536 9.64645C13.6583 9.45118 13.3417 9.45118 13.1464 9.64645L10.5 12.2929L9.85355 11.6464C9.65829 11.4512 9.34171 11.4512 9.14645 11.6464C8.95118 11.8417 8.95118 12.1583 9.14645 12.3536L10.1464 13.3536C10.3417 13.5488 10.6583 13.5488 10.8536 13.3536L13.8536 10.3536C14.0488 10.1583 14.0488 9.84171 13.8536 9.64645Z" fill="#000000"/></svg>')})`
      },

      '& .webchat__code-block-copy-button__icon': {
        backgroundColor: '#707070',
        height: '16px',
        gridColumn: 1,
        gridRow: 1,
        maskImage: 'var(--webchat__code-block-copy-button--icon-url)',
        maskRepeat: 'no-repeat',
        WebkitMaskImage: 'var(--webchat__code-block-copy-button--icon-url)',
        WebkitMaskRepeat: 'no-repeat',
        width: '16px'
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
