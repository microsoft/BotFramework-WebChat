import { type RefObject, useCallback, useRef } from 'react';

import UndoEntry from './UndoEntry';

export default function useUndoStack(
  elementRef: RefObject<HTMLInputElement | HTMLTextAreaElement>
): Readonly<{ push: (group?: string) => void; undo: () => void }> {
  const undoStackRef = useRef<UndoEntry[]>([]);

  const push = useCallback(
    (group?: string | undefined) => {
      const { current: element } = elementRef;

      if (!element) {
        return;
      }

      const { current: undoStack } = undoStackRef;

      const [firstEntry] = undoStack;
      const { selectionEnd, selectionStart, value } = element;

      if (!group || group !== firstEntry?.group) {
        value === firstEntry?.value && undoStack.shift();

        undoStack.unshift(new UndoEntry(value, selectionStart, selectionEnd, group));
      }
    },
    [elementRef, undoStackRef]
  );

  const undo = useCallback(() => {
    const { current: element } = elementRef;

    if (!element) {
      return;
    }

    const { current: undoStack } = undoStackRef;
    let lastEntry: UndoEntry | undefined;

    while (undoStack.length) {
      [lastEntry] = undoStack;

      if (lastEntry?.value === element.value) {
        undoStack.shift();
      } else {
        break;
      }
    }

    if (lastEntry) {
      element.value = lastEntry.value;

      element.selectionStart = lastEntry.selectionStart;
      element.selectionEnd = lastEntry.selectionEnd;
    } else {
      element.value = '';
    }
  }, [elementRef, undoStackRef]);

  return Object.freeze({ push, undo });
}
