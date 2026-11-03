import htmlInlineTagNames from '../../../Utils/htmlInlineTagNames';

// Inputs without a text value: checkboxes and radio buttons are named by their wrapping <label>, which is read as text.
const INPUT_TYPES_WITHOUT_TEXT_VALUE: readonly string[] = Object.freeze(['checkbox', 'file', 'radio']);

// Inline elements that screen readers read as their own items, e.g. buttons next to each other: "USA Japan", not "USAJapan".
const SEPARATED_INLINE_TAG_NAMES: readonly string[] = Object.freeze([
  'BR',
  'BUTTON',
  'IMG',
  'INPUT',
  'SELECT',
  'TEXTAREA'
]);

const SKIPPED_TAG_NAMES: readonly string[] = Object.freeze(['NOSCRIPT', 'SCRIPT', 'STYLE', 'TEMPLATE']);

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

function isInputElement(element: Element): element is HTMLInputElement {
  return element.tagName === 'INPUT';
}

function isSelectElement(element: Element): element is HTMLSelectElement {
  return element.tagName === 'SELECT';
}

function isTextAreaElement(element: Element): element is HTMLTextAreaElement {
  return element.tagName === 'TEXTAREA';
}

// Name from `aria-labelledby`, then `aria-label`, as screen readers read controls and images in the live region.
function getLabel(element: Element): string {
  return (
    (element.getAttribute('aria-labelledby') || '')
      .split(/\s+/u)
      .map(id => (id && element.ownerDocument.getElementById(id)?.textContent) || '')
      .join(' ')
      .trim() ||
    element.getAttribute('aria-label')?.trim() ||
    ''
  );
}

function getControlText(element: Element, label: string): string {
  const name = label || element.getAttribute('placeholder') || element.getAttribute('title') || '';
  const value = isInputElement(element)
    ? INPUT_TYPES_WITHOUT_TEXT_VALUE.includes(element.type)
      ? ''
      : element.value
    : isSelectElement(element)
      ? Array.from(element.selectedOptions, ({ text }) => text).join(' ')
      : isTextAreaElement(element)
        ? element.value
        : '';

  // A <select> named by its selected option (`aria-labelledby`) is read once.
  return value === name ? name : `${name} ${value}`;
}

function walk(node: Node, texts: string[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    texts.push(node.textContent || '');
  } else if (
    isElement(node) &&
    node.getAttribute('aria-hidden') !== 'true' &&
    !node.hasAttribute('hidden') &&
    !SKIPPED_TAG_NAMES.includes(node.tagName) &&
    !(isInputElement(node) && node.type === 'hidden')
  ) {
    const { tagName } = node;
    const label = getLabel(node);
    const separator = htmlInlineTagNames.includes(tagName) && !SEPARATED_INLINE_TAG_NAMES.includes(tagName) ? '' : ' ';

    texts.push(separator);

    if (tagName === 'IMG') {
      texts.push(label || node.getAttribute('alt') || '');
    } else if (tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA') {
      texts.push(getControlText(node, label));
    } else if ((tagName === 'A' || tagName === 'BUTTON') && label) {
      texts.push(label);
    } else {
      node.childNodes.forEach(child => walk(child, texts));
    }

    texts.push(separator);
  }
}

/**
 * Computes the text that a screen reader reads from a live region entry, so it can be sent via `ariaNotify()`.
 *
 * Best-effort: reads text, image alt text, names and values of form controls, and skips `aria-hidden` and hidden subtrees.
 * State, such as "checked", is not read: it would need localized words.
 */
export default function getAnnouncementText(element: Element): string {
  const texts: string[] = [];

  walk(element, texts);

  return texts.join('').replace(/\s+/gu, ' ').trim();
}
