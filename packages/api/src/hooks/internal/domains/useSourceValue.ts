import { useSyncExternalStore } from '@msinternal/botframework-webchat-react-hooks';
import { useMemo } from 'react';

import { type Source } from './Source';

function refEquality<T>(x: T, y: T): boolean {
  return x === y;
}

// Returns the previous value while `equalityFn` says it is unchanged, so `getSnapshot()` returns the same value until the
// source changes.
function createGetSnapshot<T>(source: Source<T>, equalityFn: (x: T, y: T) => boolean): () => T {
  let previous: { readonly value: T } | undefined;

  return () => {
    const value = source.get();

    if (!previous || !equalityFn(previous.value, value)) {
      previous = Object.freeze({ value });
    }

    return previous.value;
  };
}

/**
 * Reads a source and re-renders when its value changes, with the `useSyncExternalStore()` ponyfill, as `useSelector()`
 * and `<GraphProvider>` read the store.
 *
 * Every reader of the store then renders at the same priority: on React 18 and later, `useSyncExternalStore()` renders
 * at sync priority, so a reader on `useState()` or `useReducer()` would show the same change one commit later (e.g. the
 * outgoing activity before the send box clears).
 *
 * While `equalityFn` says the value is unchanged, the previous value is returned, so a custom `equalityFn` returns a
 * stable reference.
 */
export default function useSourceValue<T>(source: Source<T>, equalityFn: (x: T, y: T) => boolean = refEquality): T {
  return useSyncExternalStore(
    source.subscribe,
    useMemo(() => createGetSnapshot(source, equalityFn), [equalityFn, source])
  );
}
