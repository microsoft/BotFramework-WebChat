import noOp from './private/noOp';

import type { UndoFunction } from './types/UndoFunction';

/**
 * Listens to event. Returns a function, when called, will stop listening.
 */
export default function addEventListenerWithUndo(
  element: HTMLElement | undefined,
  name: string,
  handler: EventListener,
  options?: AddEventListenerOptions | boolean
): UndoFunction {
  if (!element) {
    return noOp;
  }

  element.addEventListener(name, handler, options);

  return () => element.removeEventListener(name, handler, options);
}
