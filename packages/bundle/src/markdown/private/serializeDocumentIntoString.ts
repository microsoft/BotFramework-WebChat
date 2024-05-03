export default function serializeDocumentIntoString(document: Document): string {
  const serializer = new XMLSerializer();

  return serializer.serializeToString(document.body);
}
