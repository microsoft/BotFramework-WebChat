import getAccessibilityNode from './getAccessibilityNode';

/**
 * Gets the accessible name of the element, as computed by the browser.
 *
 * @param {Element} element - The element to look up.
 * @returns {Promise<string | undefined>} The accessible name, or `undefined` if it has none.
 */
export default async function getAccessibleName(element) {
  return (await getAccessibilityNode(element)).name?.value;
}
