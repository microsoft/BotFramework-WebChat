import { addClass } from './private/addClass';
import noOp from './private/noOp';

import type { UndoFunction } from './types/UndoFunction';

/**
 * Adds a class to the `HTMLElement` and re-add on mutations.
 *
 * @returns {function} A function, when called, will restore to previous state.
 */
export default function durableAddClassWithUndo(element: HTMLElement | undefined, className: string): UndoFunction {
  if (element) {
    addClass(element, className);

    // After we add the class, keep observing the element to make sure the class is not removed.
    const observer = new MutationObserver(() => addClass(element, className));

    observer.observe(element, { attributes: true, attributeFilter: ['class'] });

    return () => {
      element.classList.remove(className);

      observer.disconnect();
    };
  }

  return noOp;
}
