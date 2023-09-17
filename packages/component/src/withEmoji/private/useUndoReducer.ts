import { type RefObject, useCallback, useReducer } from 'react';
import UndoEntry from './UndoEntry';

type CheckpointAction = { payload: { group: string | undefined }; type: 'CHECKPOINT' };
type UndoAction = { type: 'UNDO' };

type Action = CheckpointAction | UndoAction;

type State = {
  elementRef: RefObject<HTMLInputElement | HTMLTextAreaElement>;
  undoStack: UndoEntry[];
};

function undoReducer(state: State, action: Action): State {
  const {
    elementRef: { current: element }
  } = state;

  if (element) {
    if (action.type === 'CHECKPOINT') {
      const { selectionEnd, selectionStart, value } = element;
      const {
        payload: { group }
      } = action;

      if (!group || group !== state.undoStack[0]?.group) {
        if (value === state.undoStack[0]?.value) {
          state.undoStack.shift();
        }

        state.undoStack.unshift(new UndoEntry(value, selectionStart, selectionEnd, group));
      }
    } else if (action.type === 'UNDO') {
      let lastEntry: UndoEntry;

      while (state.undoStack.length) {
        [lastEntry] = state.undoStack;

        if (lastEntry.value === element.value) {
          state.undoStack.shift();
        } else {
          break;
        }
      }

      [lastEntry] = state.undoStack;

      if (lastEntry) {
        element.value = lastEntry.value;

        element.selectionStart = lastEntry.selectionStart;
        element.selectionEnd = lastEntry.selectionEnd;
      } else {
        element.value = '';
      }
    }
  }

  return state;
}

export default function useUndoReducer(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement>
): readonly [State, Readonly<{ checkpoint: (group?: string) => void; undo: () => void }>] {
  const [state, dispatch] = useReducer(undoReducer, { elementRef: ref, undoStack: [] });

  const checkpoint = useCallback((group: string) => dispatch({ payload: { group }, type: 'CHECKPOINT' }), [dispatch]);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);

  return Object.freeze([
    state,
    Object.freeze({
      checkpoint,
      undo
    })
  ] as const);
}
