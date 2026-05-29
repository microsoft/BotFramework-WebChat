export default function parseDocumentFragmentFromString(html: string): DocumentFragment {
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(html, 'text/html');
  const fragment = parsedDocument.createDocumentFragment();

  fragment.append(...parsedDocument.body.childNodes);

  return fragment;
}
