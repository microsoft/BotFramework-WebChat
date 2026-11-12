import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * `useReducer()`, with the reducer called once per action, when the action is dispatched, instead of during render:
 *
 * - `getState()` returns the state of the last dispatch before React renders it, as `getState()` of a Redux store, so
 *   code outside render (e.g. a submit right after setting the value) reads what was just dispatched;
 * - a render reads the state of the last dispatch, as `useSelector()` reads the Redux store: a render that React runs
 *   before the one of the dispatch (e.g. a dispatch from an effect, then a render of the parent at another priority)
 *   still shows it;
 * - Strict Mode does not call the reducer twice, so a reducer that reads the clock or warns does it once;
 * - an action that returns the same state (`Object.is()`) does not re-render.
 *
 * The reducer and the initial state are those of the first render, as a Redux store keeps its reducer. After unmount,
 * `dispatch()` still reduces (for `getState()`) without setting the state of the unmounted component.
 */
export default function useEagerReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): readonly [S, (action: A) => void, () => S] {
  const mountedRef = useRef(true);
  const reducerRef = useRef(reducer);
  const stateRef = useRef(initialState);
  // Only to re-render: the render reads the state of the last dispatch (below).
  const [, setState] = useState<S>(initialState);

  useEffect(() => {
    // Set here, not only by `useRef(true)`: Strict Mode (React 18 and later) runs the cleanup, then the effect again, on
    // the same component. Without it, the component would stop rendering its dispatches.
    mountedRef.current = true;

    // Renders what was dispatched while the effects were torn down without an unmount (e.g. inside a hidden
    // `<Activity>` of React 19.2): those dispatches updated `getState()` only. Bails out when the state is the same.
    setState(() => stateRef.current);

    return () => {
      mountedRef.current = false;
    };
  }, [mountedRef, setState, stateRef]);

  const dispatch = useCallback(
    (action: A) => {
      const nextState = reducerRef.current(stateRef.current, action);

      if (!Object.is(nextState, stateRef.current)) {
        stateRef.current = nextState;

        // As a function: the state itself may be a function.
        mountedRef.current && setState(() => nextState);
      }
    },
    [mountedRef, reducerRef, stateRef]
  );

  const getState = useCallback(() => stateRef.current, [stateRef]);

  // As `useSelector()` reads the store during render (Redux mode): the state of the last dispatch, even if React has not
  // processed the re-render of that dispatch yet (`hooks/useDictateInterims.getter.html`, default mode).
  const state = stateRef.current;

  return useMemo(() => Object.freeze([state, dispatch, getState] as const), [dispatch, getState, state]);
}
