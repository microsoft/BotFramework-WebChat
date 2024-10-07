export default function serializeDocumentFragmentIntoString(documentFragment: DocumentFragment): string {
  const serializer = new XMLSerializer();
  const elementHTML: string[] = [];

  for (const element of documentFragment.childNodes) {
    elementHTML.push(serializer.serializeToString(element));
  }

  return `${elementHTML.join('\n')}\n`.replace(/\n{2,}/gu, '\n');
}
