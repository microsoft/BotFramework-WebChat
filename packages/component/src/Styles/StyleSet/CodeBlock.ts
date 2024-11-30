export default function createCodeBlockStyle() {
  return {
    '&.webchat__code-block': {
      margin: '16px 0',
      display: 'block',
      overflow: 'hidden',
      '.webchat__code-block__body': {
        display: 'contents',
        whiteSpace: 'pre-wrap'
      }
    }
  };
}
