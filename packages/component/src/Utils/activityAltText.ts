import isSSML from './isSSML';
import textFormatToContentType from './textFormatToContentType';

/** Retrieves all text nodes from a given DOM tree as flattened array. */
function allTextContents(element: Node): string[] {
  const nodes: Node[] = [].slice.call(element.childNodes);
  const results: string[] = [];

  while (nodes.length) {
    const { childNodes, nodeType, textContent } = nodes.shift();

    if (nodeType === Node.TEXT_NODE) {
      // Concatenate only if the text content is not full of whitespaces.
      !/^\s*$/u.test(textContent) && results.push(textContent);
    } else {
      nodes.unshift(...[].slice.call(childNodes));
    }
  }

  return results;
}

/** Returns the alt text for a message activity. */
export default function activityAltText(
  activity: any,
  renderMarkdownAsHTML: (markdown: string) => string
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
      return allTextContents(new DOMParser().parseFromString(activity.speak, 'application/xml')).join('').trim();
    }

    return speak;
  }

  const text: string = activity?.channelData?.messageBack?.displayText || activity.text;

  if (!text) {
    // We will continue to narrate the activity, as empty.
    return '';
  }

  if (textFormatToContentType(activity.textFormat) === 'text/markdown') {
    return allTextContents(new DOMParser().parseFromString(renderMarkdownAsHTML(text), 'text/html'))
      .join('')
      .trim();
  }

  return text;
}
