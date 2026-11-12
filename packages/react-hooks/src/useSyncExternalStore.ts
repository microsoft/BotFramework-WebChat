import React, { useLayoutEffect, useReducer, useRef } from 'react';

type Subscribe = (onStoreChange: () => void) => () => void;

type UseSyncExternalStore = <T>(subscribe: Subscribe, getSnapshot: () => T, getServerSnapshot?: () => T) => T;

function increment(value: number): number {
  return value + 1;
}

// React 18 and later. Read from the default export: webpack 5 fails the build on a named or a namespace import of
// an export that React 16/17 does not have.
const { useSyncExternalStore: nativeUseSyncExternalStore } = React as typeof React & {
  readonly useSyncExternalStore?: UseSyncExternalStore | undefined;
};

// React 16/17, and React 18+ in the IIFE bundle without `window.ReactDOM`: subscribes in a layout effect, which runs
// again only when `subscribe` changes.
function useSyncExternalStoreFallback<T>(subscribe: Subscribe, getSnapshot: () => T): T {
  const [, forceRender] = useReducer(increment, 0);
  const value = getSnapshot();
  const latest = Object.freeze({ getSnapshot, value });
  const latestRef = useRef(latest);

  // Written while rendering: legacy roots never discard a render, and under `createRoot` every render reads
  // `getSnapshot()` itself, so a discarded render only leaves a newer value for the next change to compare with.
  latestRef.current = latest;

  useLayoutEffect(() => {
    const handleChange = () => {
      const { current } = latestRef;

      try {
        const nextValue = current.getSnapshot();

        if (Object.is(current.value, nextValue)) {
          return;
        }

        // Remembers the new value now, so another change before the re-render does not re-render again.
        latestRef.current = Object.freeze({ ...current, value: nextValue });
      } catch {
        // Re-renders to throw the error from `getSnapshot()`.
      }

      forceRender();
    };

    // Catches changes between render and subscription.
    handleChange();

    return subscribe(handleChange);
  }, [forceRender, latestRef, subscribe]);

  return value;
}

/**
 * Ponyfill of `useSyncExternalStore()`: the one of React 18 and later, otherwise a fallback for React 16/17.
 *
 * `getSnapshot` must return the same value until the store changes. Keep `subscribe` stable: the fallback subscribes again when it changes.
 */
const useSyncExternalStore: UseSyncExternalStore = nativeUseSyncExternalStore
  ? // Without `getServerSnapshot`, React 18 and later throw while rendering on the server.
    (subscribe, getSnapshot, getServerSnapshot = getSnapshot) =>
      nativeUseSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  : useSyncExternalStoreFallback;

export default useSyncExternalStore;
