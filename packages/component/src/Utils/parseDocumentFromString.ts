export default function parseDocumentFromString(html: string): Document {
  const parser = new DOMParser();

  return parser.parseFromString(html, 'text/html');
}
