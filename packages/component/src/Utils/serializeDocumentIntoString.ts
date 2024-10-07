export default function serializeDocumentIntoString(document: Document): string {
  const serializer = new XMLSerializer();
  const elementHTML: string[] = [];

  for (const element of document.body.childNodes) {
    elementHTML.push(serializer.serializeToString(element));
  }

  return `${elementHTML.join('\n')}\n`;
}
