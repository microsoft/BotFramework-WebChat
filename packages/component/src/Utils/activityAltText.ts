import htmlInlineTagNames from './htmlInlineTagNames';
import textFormatToContentType from './textFormatToContentType';

function walk<T extends Node>(root: Node, walker: (node: T) => string[]): string[] {
  const nodes: T[] = [].slice.call(root.childNodes);
  const results: string[] = [];

  while (nodes.length) {
    const node = nodes.shift();
    const { childNodes } = node;

    results.push(...(walker(node) || []));
    nodes.unshift(...[].slice.call(childNodes));
  }

  return results;
}

/**
 * Computes all text from the descendants of a given HTML node, such as a document, as flattened array. This is best-effort.
 *
 * @param {Node} root - HTML node to compute texts from.
 */
function htmlTextAlternatives(root: Node): string[] {
  // TODO: [P2] #3923 Revisit this logic with W3C standard, we could do a better text alternatives computation.
  //       For example, <abbr title="..."> is not computed.
  //       https://www.w3.org/TR/accname-1.1/#mapping_additional_nd_name
  return walk<HTMLElement>(root, node => {
    const { nodeType, tagName, textContent } = node;

    if (nodeType === Node.TEXT_NODE) {
      return [textContent];
    } else if (tagName === 'IMG') {
      return [node.getAttribute('alt')];
    } else if (!htmlInlineTagNames.includes(tagName)) {
      return ['\n'];
    }
  });
}

/**
 * Returns the text alternatives for a message activity.
 *
 * @param {object} activity - Activity to compute the text alternatives.
 * @param {function} renderMarkdownAsHTML - Callback function to render Markdown as HTML string.
 */
export default function activityAltText(
  activity: any,
  renderMarkdownAsHTML?: (markdown: string) => string
): false | string {
  if (activity.type !== 'message') {
    return false;
  }

  const fallbackText = activity?.channelData?.['webchat:fallback-text'];

  if (typeof fallbackText === 'string') {
    // If `fallbackText` is an empty string, we will treat the activity as presentational and skip narrating it (return false).
    return fallbackText || false;
  }

  const text = activity?.channelData?.messageBack?.displayText || activity.text;

  if (!text) {
    // We will continue to narrate the activity, as empty.
    return '';
  }

  if (renderMarkdownAsHTML && textFormatToContentType(activity.textFormat) === 'text/markdown') {
    return htmlTextAlternatives(new DOMParser().parseFromString(renderMarkdownAsHTML(text), 'text/html'))
      .join('')
      .replace(/\n{2,}/gu, '\n')
      .trim();
  }

  return text;
}

export { htmlTextAlternatives };
