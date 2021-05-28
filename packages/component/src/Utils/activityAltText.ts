import isSSML from './isSSML';
import textFormatToContentType from './textFormatToContentType';

function walk<T extends Node>(document: Document, walker: (node: T) => string[]): string[] {
  const nodes: T[] = [].slice.call(document.childNodes);
  const results: string[] = [];

  while (nodes.length) {
    const node = nodes.shift();
    const { childNodes } = node;

    results.push(...(walker(node) || []));
    nodes.unshift(...[].slice.call(childNodes));
  }

  return results;
}

/** Retrieves all text nodes from a given XML document as flattened array. */
function xmlTextContents(document: Document): string[] {
  return walk(document, ({ nodeType, textContent }) => {
    if (nodeType === Node.TEXT_NODE) {
      return [textContent];
    }
  });
}

// From https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
const HTML_INLINE_TAGS = [
  'A',
  'ABBR',
  'ACRONYM',
  'AUDIO',
  'B',
  'BDI',
  'BDO',
  'BIG',
  'BR',
  'BUTTON',
  'CANVAS',
  'CITE',
  'CODE',
  'DATA',
  'DATALIST',
  'DEL',
  'DFN',
  'EM',
  'EMBED',
  'I',
  'IFRAME',
  'IMG',
  'INPUT',
  'INS',
  'KBD',
  'LABEL',
  'MAP',
  'MARK',
  'METER',
  'NOSCRIPT',
  'OBJECT',
  'OUTPUT',
  'PICTURE',
  'PROGRESS',
  'Q',
  'RUBY',
  'S',
  'SAMP',
  'SCRIPT',
  'SELECT',
  'SLOT',
  'SMALL',
  'SPAN',
  'STRONG',
  'SUB',
  'SUP',
  'SVG',
  'TEMPLATE',
  'TEXTAREA',
  'TIME',
  'U',
  'TT',
  'VAR',
  'VIDEO',
  'WBR'
];

/** Computes all text from a given HTML document as flattened array. This is best-effort. */
function htmlTextContents(document: Document): string[] {
  return walk<HTMLElement>(document, node => {
    const { nodeType, tagName, textContent } = node;

    if (nodeType === Node.TEXT_NODE) {
      return [textContent];
    } else if (tagName === 'IMG') {
      return [node.getAttribute('alt') || node.getAttribute('title')];
    } else if (!HTML_INLINE_TAGS.includes(tagName)) {
      return ['\n'];
    }
  });
}

/** Returns the alt text for a message activity. */
export default function activityAltText(
  activity: any,
  renderMarkdownAsHTML?: (markdown: string) => string
): false | string {
  if (activity.type !== 'message') {
    return false;
  }

  const { speak } = activity;

  if (speak === '') {
    // We will treat the activity as presentational and skip narrating it.
    return false;
  }

  if (typeof speak === 'string') {
    if (isSSML(speak)) {
      return xmlTextContents(new DOMParser().parseFromString(activity.speak, 'application/xml'))
        .join('')
        .replace(/\n{2,}/gu, '\n')
        .trim();
    }

    return speak;
  }

  const text = activity?.channelData?.messageBack?.displayText || activity.text;

  if (!text) {
    // We will continue to narrate the activity, as empty.
    return '';
  }

  if (renderMarkdownAsHTML && textFormatToContentType(activity.textFormat) === 'text/markdown') {
    return htmlTextContents(new DOMParser().parseFromString(renderMarkdownAsHTML(text), 'text/html'))
      .join('')
      .replace(/\n{2,}/gu, '\n')
      .trim();
  }

  return text;
}
