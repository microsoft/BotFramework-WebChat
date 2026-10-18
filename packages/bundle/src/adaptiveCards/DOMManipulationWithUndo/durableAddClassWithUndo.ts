import { addClass } from './private/addClass';
import noOp from './private/noOp';

import type { UndoFunction } from './types/UndoFunction';

/**
 * Adds one or more space-separated classes to the `HTMLElement` and re-add on mutations.
 *
 * @returns {function} A function, when called, will restore to previous state.
 */
export default function durableAddClassWithUndo(element: HTMLElement | undefined, className: string): UndoFunction {
  const classNames = className.split(/\s+/u).filter(Boolean);

  if (element && classNames.length) {
    const addClasses = () => classNames.forEach(name => addClass(element, name));

    addClasses();

    // After we add the classes, keep observing the element to make sure the classes are not removed.
    const observer = new MutationObserver(addClasses);

    observer.observe(element, { attributes: true, attributeFilter: ['class'] });

    return () => {
      element.classList.remove(...classNames);

      observer.disconnect();
    };
  }

  return noOp;
}
