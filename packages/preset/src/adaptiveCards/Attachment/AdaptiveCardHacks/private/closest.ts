// Ponyfill `HTMLElement.closest`.
// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
export default function closest(element: HTMLElement, selector: string): HTMLElement | undefined {
  if (typeof element.closest === 'function') {
    return element.closest(selector);
  }

  let current: HTMLElement | null = element;

  while (current) {
    // "msMatchesSelector" is vendor-prefixed version of "matches".
    if ((current.matches || (current['msMatchesSelector'] as (selector: string) => boolean)).call(current, selector)) {
      return current;
    }

    current = current.parentElement;
  }
}
