export default function textFormatToContentType(
  textFormat: string | undefined
): 'text/markdown' | 'text/plain' | 'text/xml' {
  switch (textFormat) {
    case 'plain':
      return 'text/plain';

    case 'xml':
      return 'text/xml';

    default:
      return 'text/markdown';
  }
}
