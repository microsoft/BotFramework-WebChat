export default function serializeDocumentIntoString(document: Document): string {
  const serializer = new XMLSerializer();
  let html = '';

  for (const element of document.body.children) {
    html += serializer.serializeToString(element);
  }

  return html;
}
