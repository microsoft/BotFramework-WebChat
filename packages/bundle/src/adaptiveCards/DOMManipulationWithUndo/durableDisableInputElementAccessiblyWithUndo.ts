import addEventListenerWithUndo from './addEventListenerWithUndo';
import bunchUndos from './bunchUndos';
import noOp from './private/noOp';
import setOrRemoveAttributeIfFalseWithUndo from './setOrRemoveAttributeIfFalseWithUndo';

import type { UndoFunction } from './types/UndoFunction';

/**
 * An event handler for disabling event bubbling and propagation.
 */
function disabledHandler(event: Event): void {
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();
}

function disable(element: HTMLElement, undoStack: UndoFunction[]): void {
  const tag = element.nodeName.toLowerCase();

  /* eslint-disable-next-line default-case */
  switch (tag) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      undoStack.push(
        // "click" handler in capture phase to make sure we can block as much "click" event listeners as possible.
        addEventListenerWithUndo(element, 'click', disabledHandler, { capture: true }),
        setOrRemoveAttributeIfFalseWithUndo(element, 'aria-disabled', 'true'),
        setOrRemoveAttributeIfFalseWithUndo(element, 'tabindex', '-1')
      );

      if (tag === 'input' || tag === 'textarea') {
        undoStack.push(setOrRemoveAttributeIfFalseWithUndo(element, 'readonly', 'readonly'));
      } else if (tag === 'select') {
        undoStack.push(
          ...Array.from(element.querySelectorAll('option') as NodeListOf<HTMLOptionElement>).map(option =>
            setOrRemoveAttributeIfFalseWithUndo(option, 'disabled', 'disabled')
          )
        );
      }

      break;
  }
}

/**
 * Disables an input element in accessible fashion with undo function.
 *
 * This is designed for accessibility and mimick the behavior of `disabled` attribute in accessible form:
 *
 * - Take away from focus ring;
 *   - If currently focused, do not move focus;
 * - Mark content as readonly.
 *
 * Thus, it should not impact hyperlinks or other contents which are not affected by `disabled` attribute.
 *
 * For simplicity, currently, we did not disable element with `contenteditable` attribute.
 *
 * We only disable these elements: `<button>`, `<input>`, `<select>`, `<textarea>`.
 *
 * We need durability as Adaptive Cards occasionally reset `tabindex="0"`.
 *
 * @returns {function} A function, when called, will restore to previous state.
 */
export default function durableDisableInputElementAccessiblyWithUndo(element: HTMLElement | undefined): UndoFunction {
  if (!element) {
    return noOp;
  }

  const undoStack: UndoFunction[] = [];

  const apply = () => disable(element, undoStack);

  apply();

  const observer = new MutationObserver(apply);

  observer.observe(element, { attributeFilter: ['tabindex'] });

  undoStack.push(() => observer.disconnect());

  return bunchUndos(undoStack);
}
