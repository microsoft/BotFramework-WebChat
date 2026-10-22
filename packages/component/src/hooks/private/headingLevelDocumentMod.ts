const MAX_HTML_HEADING_LEVEL = 6;

// Headings this mod changed are marked with the level written in Markdown, which also keeps their look.
const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6, [role="heading"][class*="render-markdown__heading--level-"]';
const HTML_HEADING_LOCAL_NAME_PATTERN = /^h([1-6])$/u;
const WRITTEN_LEVEL_CLASS_NAME_PATTERN = /^render-markdown__heading--level-([1-6])$/u;

// Exact class token first, then the tag name; anything else (e.g. `--level-something`) is not a heading of ours.
function getWrittenLevel(headingElement: Element): number | undefined {
  const levelString =
    Array.from(headingElement.classList, className => WRITTEN_LEVEL_CLASS_NAME_PATTERN.exec(className)?.[1]).find(
      Boolean
    ) ?? HTML_HEADING_LOCAL_NAME_PATTERN.exec(headingElement.localName)?.[1];

  return levelString ? +levelString : undefined;
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
  const headings = Array.from(root.querySelectorAll(HEADING_SELECTOR), headingElement =>
    Object.freeze([headingElement, getWrittenLevel(headingElement)] as const)
  ).filter((heading): heading is readonly [Element, number] => typeof heading[1] === 'number');

  const minWrittenLevel = Math.min(...headings.map(([, writtenLevel]) => writtenLevel));

  for (const [headingElement, writtenLevel] of headings) {
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
