/**
 * Sets or removes an attribute from an element.
 *
 * @param {HTMLElement} element - The element to set or remove attribute from.
 * @param {string} qualifiedName - The name of the attribute.
 * @param {false | string} value - The value of the attribute. When passing `false`, remove the attribute.
 */
export default function setOrRemoveAttributeIfFalse(
  element: HTMLElement | undefined,
  qualifiedName: string,
  value: false | string
): void {
  if (value === false) {
    element?.removeAttribute(qualifiedName);
  } else {
    element?.setAttribute(qualifiedName, value);
  }
}
