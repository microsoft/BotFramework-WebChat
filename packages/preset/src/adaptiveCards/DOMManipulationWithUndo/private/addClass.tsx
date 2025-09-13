/**
 * Adds a class to the `HTMLElement`. Returns `true` if the class is added, otherwise, `undefined`.
 */

export function addClass(element: HTMLElement, className: string): true | undefined {
  const { classList } = element;

  if (!classList.contains(className)) {
    classList.add(className);

    return true;
  }
}
