export default function stripParagraphContainer(html: string): string {
  return html
    .trim()
    .replace(/^<p\sxmlns="http:\/\/www.w3.org\/1999\/xhtml">/u, '')
    .replace(/<\/p>$/u, '');
}
