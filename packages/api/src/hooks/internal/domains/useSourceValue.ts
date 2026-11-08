import { useLayoutEffect, useReducer, useRef } from 'react';

import { type Source } from './Source';

function increment(value: number): number {
  return value + 1;
}

function refEquality<T>(x: T, y: T): boolean {
  return x === y;
}

/**
 * Reads a source and re-renders when its value changes.
 *
 * This is the `useSelector()` that `WebChatReduxContext` had (like `useSelector()` of `react-redux@7`), with
 * `selector(store.getState())` replaced by `source.get()`. Under the Redux store, it re-renders on the same changes, in
 * the same batch and with the same priority.
 *
 * Re-renders are scheduled by `useReducer()`, at the same priority as `useState()` of other components that follow the store.
 * `useSyncExternalStore()` would re-render with a higher priority on React 18 and later,
 * ahead of activities that `<GraphProvider>` propagates through `useState()`.
 */
export default function useSourceValue<T>(source: Source<T>, equalityFn: (x: T, y: T) => boolean = refEquality): T {
  const [, forceRender] = useReducer(increment, 0);
  const latestRef = useRef<
    | {
        readonly equalityFn: (x: T, y: T) => boolean;
        readonly source: Source<T>;
        readonly value: T;
      }
    | undefined
  >();

  const nextValue = source.get();

  // Keeps the previous value if it is equal, so a custom `equalityFn` returns a stable reference.
  const value =
    latestRef.current && equalityFn(latestRef.current.value, nextValue) ? latestRef.current.value : nextValue;

  useLayoutEffect(() => {
    latestRef.current = Object.freeze({ equalityFn, source, value });
  });

  useLayoutEffect(() => {
    const handleChange = () => {
      const { current } = latestRef;

      try {
        const nextValue = current.source.get();

        if (current.equalityFn(current.value, nextValue)) {
          return;
        }

        // Remembers the new value now, so a dispatch before the re-render (e.g. during render) does not re-render again.
        latestRef.current = Object.freeze({ ...current, value: nextValue });
      } catch {
        // Re-renders to throw the error from the source.
      }

      forceRender();
    };

    // Catches changes between render and subscription.
    handleChange();

    return source.subscribe(handleChange);
  }, [forceRender, latestRef, source]);

  return value;
}
