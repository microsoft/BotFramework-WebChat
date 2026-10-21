const MAX_HTML_HEADING_LEVEL = 6;

/**
 * Lowers every heading by `offset` levels, e.g. `<h1>` becomes `<h2>` when `offset` is `1`.
 *
 * Levels beyond `<h6>` become `<div aria-level="7" role="heading">` and so on.
 *
 * Each heading is marked with the level it was written in, e.g. `render-markdown__heading--level-1`, to keep its look.
 */
export default function headingLevelDocumentMod<T extends Document | DocumentFragment>(
  documentFragment: T,
  offset: number
): T {
  for (const headingElement of documentFragment.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    const writtenLevel = +headingElement.tagName.substring(1);
    const level = writtenLevel + offset;

    const nextHeadingElement = document.createElement(level > MAX_HTML_HEADING_LEVEL ? 'div' : `h${level}`);

    if (level > MAX_HTML_HEADING_LEVEL) {
      nextHeadingElement.setAttribute('aria-level', `${level}`);
      nextHeadingElement.setAttribute('role', 'heading');
    }

    nextHeadingElement.classList.add(`render-markdown__heading--level-${writtenLevel}`);
    nextHeadingElement.append(...headingElement.childNodes);

    headingElement.replaceWith(nextHeadingElement);
  }

  return documentFragment;
}
