import getAttributeOrFalse from './private/getAttributeOrFalse';
import noOp from './private/noOp';
import setOrRemoveAttributeIfFalse from './private/setOrRemoveAttributeIfFalse';

import type { UndoFunction } from './types/UndoFunction';

/**
 * Sets or removes an attribute from an element with an undo function, which restores only if the attribute was not changed since.
 *
 * Use this over `setOrRemoveAttributeIfFalseWithUndo` when other code may rewrite the attribute without re-rendering,
 * so undo will not overwrite the newer value with a stale one.
 *
 * @param {HTMLElement} element - The element to set or remove attribute from.
 * @param {string} qualifiedName - The name of the attribute.
 * @param {false | string} value - The value of the attribute. When passing `false`, remove the attribute.
 *
 * @returns {() => void} An undo function, when called, will restore the value recorded at the time of the function call, if the attribute still has the value set by this function.
 */
export default function setOrRemoveAttributeIfFalseWithUndoIfUnchanged(
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

  return () => {
    getAttributeOrFalse(element, qualifiedName) === value &&
      setOrRemoveAttributeIfFalse(element, qualifiedName, prevValue);
  };
}
