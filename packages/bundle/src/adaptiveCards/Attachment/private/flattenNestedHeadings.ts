const HEADING_SELECTOR = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '[role="heading"]'];

const NESTED_HEADING_SELECTOR = HEADING_SELECTOR.map(selector => `[role="heading"] ${selector}`).join(', ');

/**
 * Renders headings inside a heading as text, e.g. Markdown `# Title` in a `TextBlock` with `style: "heading"`.
 */
export default function flattenNestedHeadings(element: HTMLElement): void {
  for (const headingElement of element.querySelectorAll(NESTED_HEADING_SELECTOR)) {
    const textElement = headingElement.ownerDocument.createElement('div');

    textElement.append(...headingElement.childNodes);

    headingElement.replaceWith(textElement);
  }
}
