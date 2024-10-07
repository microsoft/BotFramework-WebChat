export default function parseDocumentFragmentFromString(html: string): DocumentFragment {
  const parser = new DOMParser();
  const fragment = new DocumentFragment();

  fragment.append(...parser.parseFromString(html, 'text/html').body.childNodes);

  return fragment;
}
