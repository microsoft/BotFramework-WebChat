export default function serializeDocumentIntoString(document: Document): string {
  const serializer = new XMLSerializer();

  return serializer
    .serializeToString(document)
    .replace('<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>', '')
    .replace('</body></html>', '');
}
