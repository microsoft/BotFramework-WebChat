import CustomPropertyNames from '../CustomPropertyNames';

export default function createCodeBlockStyle() {
  return {
    '&.webchat__code-block': {
      background: `var(${CustomPropertyNames.BackgroundCodeBlock}, inherit)`,
      border: '1px solid #d1d1d1',
      borderRadius: '4px',
      color: `var(${CustomPropertyNames.ColorCodeBlock}, currentColor)`,
      display: 'block',
      margin: '16px 0',
      overflow: 'hidden',
      padding: '4px 4px 4px 8px',

      ':has(> .github-dark-default)': {
        background: `var(${CustomPropertyNames.BackgroundCodeBlock}, #0d1117)`,
        color: `var(${CustomPropertyNames.ColorCodeBlock}, #e6edf3)`
      },

      ':has(> .github-light-default)': {
        background: `var(${CustomPropertyNames.BackgroundCodeBlock}, #ffffff)`,
        color: `var(${CustomPropertyNames.ColorCodeBlock}, #1f2328)`
      },

      ':has(.webchat__code-block__body:focus-visible):focus-within': {
        outline: '2px solid #000',
        outlineOffset: '-2px'
      },

      '.webchat__code-block__body': {
        display: 'contents',
        lineHeight: 'normal',
        margin: '0',
        outline: 'none',
        whiteSpace: 'pre-wrap'
      }
    }
  };
}
