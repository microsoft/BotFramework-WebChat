export default function closest(element: HTMLElement, selector: string): HTMLElement | undefined {
  if (typeof element.closest === 'function') {
    return element.closest(selector);
  }

  let current: HTMLElement | null = element;

  while (current) {
    if (current.matches(selector)) {
      return current;
    }

    current = current.parentElement;
  }
}
