export default function createCodeBlockStyle() {
  return {
    '&.webchat__code-block': {
      margin: '16px 0',
      display: 'block',
      overflow: 'hidden',
      padding: '4px',
      borderRadius: '4px',
      border: '1px solid #d1d1d1',

      ':has(> .github-dark-default)': {
        backgroundColor: 'var(--webchat__code-block--background, #0d1117)',
        color: 'var(--webchat__code-block--color, #e6edf3)'
      },

      ':has(> .github-light-default)': {
        backgroundColor: 'var(--webchat__code-block--background, inherit)',
        color: 'var(--webchat__code-block--color, currentColor)'
      },

      ':has(.webchat__code-block__body:focus-visible):focus-within': {
        outline: '2px solid #000',
        outlineOffset: '-2px'
      },

      '.webchat__code-block__body': {
        margin: '0 0 0 4px',
        whiteSpace: 'pre-wrap',
        lineHeight: 'normal',
        outline: 'none'
      }
    }
  };
}
