/**
 * Gets the value of an attribute from an element.
 *
 * @returns {false | string} The value of the attribute. `false` if the attribute was not set.
 */
export default function getAttributeOrFalse(element: HTMLElement, qualifiedName: string): false | string {
  return !!element && element.hasAttribute(qualifiedName) && (element.getAttribute(qualifiedName) || '');
}
