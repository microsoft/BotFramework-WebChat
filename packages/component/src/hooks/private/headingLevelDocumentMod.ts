const MAX_HTML_HEADING_LEVEL = 6;

// Headings this mod changed are marked with the level written in Markdown, which also keeps their look.
const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6, [role="heading"][class*="render-markdown__heading--level-"]';
const WRITTEN_LEVEL_PATTERN = /\brender-markdown__heading--level-([1-6])\b/u;

function getWrittenLevel(headingElement: Element): number {
  return +(WRITTEN_LEVEL_PATTERN.exec(headingElement.className)?.[1] ?? headingElement.localName.substring(1));
}

/**
 * Moves the top heading to `startAt` and keeps the depth of the others,
 * e.g. `<h1>` and `<h2>` become `<h2>` and `<h3>` when `startAt` is `2`, and so do `<h2>` and `<h3>`.
 *
 * Levels beyond `<h6>` become `<div aria-level="7" role="heading">` and so on.
 *
 * Changed headings are marked with the level written in Markdown, e.g. `render-markdown__heading--level-1`.
 *
 * Can run again on the same content, e.g. after more Markdown is streamed: only headings with a new level are replaced.
 */
export default function headingLevelDocumentMod<T extends DocumentFragment | Element>(root: T, startAt: number): T {
  const headingElements = Array.from(root.querySelectorAll(HEADING_SELECTOR));
  const minWrittenLevel = Math.min(...headingElements.map(getWrittenLevel));

  for (const headingElement of headingElements) {
    const writtenLevel = getWrittenLevel(headingElement);
    const level = writtenLevel - minWrittenLevel + startAt;
    const ariaLevel = level > MAX_HTML_HEADING_LEVEL ? `${level}` : null;
    const localName = ariaLevel ? 'div' : `h${level}`;

    if (headingElement.localName !== localName || headingElement.getAttribute('aria-level') !== ariaLevel) {
      const nextHeadingElement = headingElement.ownerDocument.createElement(localName);

      if (ariaLevel) {
        nextHeadingElement.setAttribute('aria-level', ariaLevel);
        nextHeadingElement.setAttribute('role', 'heading');
      }

      nextHeadingElement.classList.add(`render-markdown__heading--level-${writtenLevel}`);
      nextHeadingElement.append(...headingElement.childNodes);

      headingElement.replaceWith(nextHeadingElement);
    }
  }

  return root;
}
