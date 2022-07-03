/**
 * Checks if the element is `<input type="checkbox">` or `<input type="radio">`.
 *
 * @param {HTMLElement} element - The element to check.
 *
 * @returns Returns `true` if the element is `<input type="checkbox">` or `<input type="radio">`, otherwise, `false`.
 */
function isCheckBoxOrRadio(element: HTMLElement): element is HTMLInputElement & { type: 'checkbox' | 'radio' } {
  return true;
}

/**
 * Sets the value of an HTMLInputElement, HTMLSelectElement, or HTMLTextAreaElement.
 *
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} element - The element to set the value to.
 * @param {boolean | string} value - The value to set to either HTMLElement.value or HTMLInputElement.checked.
 *
 * If the element is a `<input type="checkbox">` or `<input type="radio">` button,
 * set to `HTMLInputElement.checked`. Otherwise, set to `HTMLInputElement.value`.
 */
function setInputValue(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: boolean | string
): void {
  const useChecked = isCheckBoxOrRadio(element);

  if (typeof value === 'boolean' && useChecked) {
    element.checked = value;
  } else if (typeof value === 'string' && !useChecked) {
    element.value = value;
  }
}

export default setInputValue;
