import { useLayoutEffect, useMemo, useState } from 'react';

import { type ReadonlyKeyedStore } from './createKeyedStore';

/**
 * Returns the value of the key in the store, and re-renders when it changes.
 *
 * When React 18 is the minimum, replace the body with
 * `useSyncExternalStore(useCallback(listener => store.subscribe(key, listener), [key, store]), () => store.get(key))`.
 */
export default function useKeyedStoreValue<T>(store: ReadonlyKeyedStore<T>, key: string): readonly [T | undefined] {
  const value = store.get(key);

  // The state only triggers re-renders. It holds the key: after a key switch, the re-check below always re-renders,
  // even if the value of the new key has just changed to the value rendered for the previous key.
  const [, setState] = useState<readonly [string, T | undefined]>(() => Object.freeze([key, value]));

  useLayoutEffect(() => {
    const handleChange = () =>
      setState(state => {
        const nextValue = store.get(key);

        return state[0] === key && Object.is(state[1], nextValue) ? state : Object.freeze([key, nextValue]);
      });

    // Catches changes between render and subscription.
    handleChange();

    return store.subscribe(key, handleChange);
  }, [key, store]);

  return useMemo(() => Object.freeze([value] as const), [value]);
}
