import isSSML from './isSSML';

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

/** Returns the alt text for an activity. */
export default function activityAltText(activity: any): false | string {
  const { speak } = activity;

  if (typeof speak !== 'string') {
    return activity?.channelData?.messageBack?.displayText || activity.text;
  } else if (speak === '') {
    return false;
  }

  if (isSSML(speak)) {
    const parser = new DOMParser();

    const doc = parser.parseFromString(activity.speak, 'application/xml');

    return allTextContents(doc).join('').trim();
  }

  return speak;
}
