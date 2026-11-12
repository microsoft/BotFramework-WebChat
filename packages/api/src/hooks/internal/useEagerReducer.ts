import * as React from 'react';
import { useMemo, useState } from 'react';

import { type Source } from './domains/Source';
import useSourceValue from './domains/useSourceValue';

type EagerStore<S, A> = {
  readonly dispatch: (action: A) => void;
  readonly getState: () => S;
  readonly subscribe: (listener: () => void) => () => void;
};

function createEagerStore<S, A>(reducer: (state: S, action: A) => S, initialState: S): EagerStore<S, A> {
  const listeners = new Set<() => void>();
  let state = initialState;

  return Object.freeze({
    dispatch: (action: A) => {
      const nextState = reducer(state, action);

      if (!Object.is(nextState, state)) {
        state = nextState;

        for (const listener of Array.from(listeners)) {
          listener();
        }
      }
    },
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }
  });
}

// React 16 and 17 have no `useSyncExternalStore()`: `useSourceValue()` reads the store the same way (the snapshot during
// render, the subscription checked again once subscribed), without the tearing check of React 18.
function useSyncExternalStoreFallback<S>(subscribe: (listener: () => void) => () => void, getSnapshot: () => S): S {
  return useSourceValue(
    useMemo<Source<S>>(() => Object.freeze({ get: getSnapshot, subscribe }), [getSnapshot, subscribe])
  );
}

const useSyncExternalStore: <S>(subscribe: (listener: () => void) => () => void, getSnapshot: () => S) => S =
  (React as any).useSyncExternalStore || useSyncExternalStoreFallback;

/**
 * `useReducer()`, with the reducer called once per action, when the action is dispatched, instead of during render. The
 * state is a small external store read with `useSyncExternalStore()`:
 *
 * - `getState()` returns the state of the last dispatch before React renders it, as `getState()` of a Redux store, so
 *   code outside render (e.g. a submit right after setting the value) reads what was just dispatched;
 * - a render reads the state of the last dispatch, as `useSelector()` reads the Redux store, so a render that React runs
 *   before the one of the dispatch still shows it; a dispatch while the effects are torn down (e.g. a hidden
 *   `<Activity>` of React 19.2) renders once they run again;
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
  const [{ dispatch, getState, subscribe }] = useState(() => createEagerStore(reducer, initialState));
  const state = useSyncExternalStore(subscribe, getState);

  return useMemo(() => Object.freeze([state, dispatch, getState] as const), [dispatch, getState, state]);
}
