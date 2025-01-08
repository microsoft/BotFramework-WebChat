export default function serializeDocumentFragmentIntoString(documentFragment: DocumentFragment): string {
  return new XMLSerializer().serializeToString(documentFragment).trim();
}
