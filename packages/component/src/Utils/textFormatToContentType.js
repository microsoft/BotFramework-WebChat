export default function textFormatToContentType(textFormat) {
  switch (textFormat) {
    case 'plain':
      return 'text/plain';

    case 'xml':
      return 'text/xml';

    default:
      return 'text/markdown';
  }
}
