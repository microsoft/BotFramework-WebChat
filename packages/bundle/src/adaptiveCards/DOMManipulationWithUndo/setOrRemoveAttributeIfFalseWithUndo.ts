import getAttributeOrFalse from './private/getAttributeOrFalse';
import noOp from './private/noOp';
import setOrRemoveAttributeIfFalse from './private/setOrRemoveAttributeIfFalse';

import type { UndoFunction } from './types/UndoFunction';

/**
 * Sets or removes an attribute from an element with an undo function.
 *
 * @param {HTMLElement} element - The element to set or remove attribute from.
 * @param {string} qualifiedName - The name of the attribute.
 * @param {false | string} value - The value of the attribute. When passing `false`, remove the attribute.
 *
 * @returns {() => void} An undo function, when called, will undo all manipulations by restoring values recorded at the time of the function call.
 */
export default function setOrRemoveAttributeIfFalseWithUndo(
  element: HTMLElement | undefined,
  qualifiedName: string,
  value: false | string
): UndoFunction {
  if (!element) {
    return noOp;
  }

  const prevValue = getAttributeOrFalse(element, qualifiedName);

  if (prevValue === value) {
    return noOp;
  }

  setOrRemoveAttributeIfFalse(element, qualifiedName, value);

  return () => setOrRemoveAttributeIfFalse(element, qualifiedName, prevValue);
}
