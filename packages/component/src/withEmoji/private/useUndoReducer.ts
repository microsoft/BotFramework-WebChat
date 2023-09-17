import { type RefObject, useCallback, useReducer } from 'react';
import UndoEntry from './UndoEntry';

type CheckpointAction = { payload: { reason: string }; type: 'CHECKPOINT' };
type MoveCaretAction = { type: 'MOVE_CARET' };
type UndoAction = { type: 'UNDO' };

type Action = CheckpointAction | MoveCaretAction | UndoAction;

type State = {
  caretMoved: boolean;
  elementRef: RefObject<HTMLInputElement | HTMLTextAreaElement>;
  undoStack: UndoEntry[];
};

function undoReducer(state: State, action: Action): State {
  const {
    elementRef: { current: element }
  } = state;

  if (element) {
    if (action.type === 'CHECKPOINT') {
      // const [lastEntry] = state.undoStack;
      // const lastReason = lastEntry ? lastEntry.reason : 'change';
      const { selectionEnd, selectionStart, value } = element;
      const {
        payload: { reason }
      } = action;

      let shouldPush = false;

      // if (state.caretMoved) {
      //   if (valueChanged) {
      //     shouldPush = true;
      //   }

      //   state.caretMoved = false;
      // } else if (reasonChanged) {
      //   shouldPush = true;
      // }

      shouldPush = true;

      // if (reason !== 'move caret' && (lastEntry?.value || '') === value) {
      //   shouldPush = false;
      // }

      // eslint-disable-next-line no-console
      console.log('checkpoint', reason, value);

      shouldPush = reason === 'move caret' || reason !== state.undoStack[0]?.reason;

      if (shouldPush) {
        if (value === state.undoStack[0]?.value) {
          state.undoStack.shift();
        }

        state.undoStack.unshift(new UndoEntry(value, selectionStart, selectionEnd, reason));
        // eslint-disable-next-line no-console
        console.log('checkpoint', new UndoEntry(value, selectionStart, selectionEnd, reason).toString());
      }
    } else if (action.type === 'MOVE_CARET') {
      // eslint-disable-next-line no-console
      console.log('move caret');
      state.caretMoved = true;
    } else if (action.type === 'UNDO') {
      let lastEntry: UndoEntry;

      while (state.undoStack.length) {
        [lastEntry] = state.undoStack;

        if (lastEntry.value === element.value) {
          state.undoStack.shift();
          // } else if (lastEntry.reason === 'change') {
          //   state.undoStack.shift();
        } else {
          break;
        }
      }

      [lastEntry] = state.undoStack;

      if (lastEntry) {
        // eslint-disable-next-line no-console
        console.log(lastEntry.toString());

        element.value = lastEntry.value;

        element.selectionStart = lastEntry.selectionStart;
        element.selectionEnd = lastEntry.selectionEnd;
      } else {
        element.value = '';
      }

      // eslint-disable-next-line no-console
      console.log(state.undoStack.map(entry => entry.toString()));
    }
  }

  const pre = document.querySelector('pre');

  if (pre) {
    pre.textContent = state.undoStack.map(entry => entry.toString()).join('\n');
  }

  return state;
}

export default function useUndoReducer(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement>
): readonly [State, Readonly<{ checkpoint: (reason: string) => void; moveCaret: () => void; undo: () => void }>] {
  const [state, dispatch] = useReducer(undoReducer, { caretMoved: false, elementRef: ref, undoStack: [] });

  const checkpoint = useCallback((reason: string) => dispatch({ payload: { reason }, type: 'CHECKPOINT' }), [dispatch]);
  // const moveCaret = useCallback(() => dispatch({ type: 'MOVE_CARET' }), [dispatch]);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);

  return Object.freeze([
    state,
    Object.freeze({
      checkpoint,
      moveCaret: () => checkpoint('move caret'),
      undo
    })
  ] as const);
}
