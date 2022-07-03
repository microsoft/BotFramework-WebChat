function getInputValue<T extends HTMLInputElement & { type: 'checkbox' | 'radio' }>(element: T): boolean;
function getInputValue<
  T extends (HTMLInputElement & { type: Omit<string, 'checkbox' | 'radio'> }) | HTMLSelectElement | HTMLTextAreaElement
>(element: T): string;

/**
 * Gets the value of an HTMLInputElement, HTMLSelectElement, or HTMLTextAreaElement.
 *
 * @returns {boolean | string} If the element is a checkbox or radio button, returns `HTMLInputElement.checked`.
 * Otherwise, returns a `string`.
 */
function getInputValue(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): boolean | string {
  if (element instanceof HTMLInputElement) {
    const { type } = element;

    if (type === 'checkbox' || type === 'radio') {
      return element.checked;
    }
  }

  return element.value;
}

export default getInputValue;
