import { useMemo, useState } from 'react';

import { type Source } from './domains/Source';
import useSourceValue from './domains/useSourceValue';

function createEagerStore<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): Source<S> & {
  readonly dispatch: (action: A) => void;
} {
  const listeners = new Set<() => void>();
  let state = initialState;

  return Object.freeze({
    // Notifies on every action: `useSourceValue()` re-renders only when the state changed (`Object.is()`).
    dispatch: (action: A) => {
      state = reducer(state, action);

      for (const listener of Array.from(listeners)) {
        listener();
      }
    },
    get: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }
  });
}

/**
 * `useReducer()`, with the reducer called once per action, when the action is dispatched, instead of during render. The
 * state is a small store read with `useSourceValue()`, as the Redux bridge reads the Redux store, so both modes render
 * at the same priority (`useSyncExternalStore()` would render at a higher one on React 18 and later):
 *
 * - `getState()` returns the state of the last dispatch before React renders it, as `getState()` of a Redux store, so
 *   code outside render (e.g. a submit right after setting the value) reads what was just dispatched;
 * - a render reads the state of the last dispatch, as `useSelector()` reads the Redux store, so a render that React runs
 *   before the one of the dispatch still shows it; a dispatch while the effects are torn down (e.g. a hidden
 *   `<Activity>` of React 19.2) renders once they run again, as the value is checked again when subscribing;
 * - Strict Mode does not call the reducer twice, so a reducer that reads the clock or warns does it once;
 * - an action that returns the same state (`Object.is()`) does not re-render.
 *
 * The reducer and the initial state are those of the first render, as a Redux store keeps its reducer. After unmount,
 * `dispatch()` still reduces, for `getState()`.
 */
export default function useEagerReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): readonly [S, (action: A) => void, () => S] {
  const [store] = useState(() => createEagerStore(reducer, initialState));
  const state = useSourceValue(store);

  return useMemo(() => Object.freeze([state, store.dispatch, store.get] as const), [state, store]);
}
