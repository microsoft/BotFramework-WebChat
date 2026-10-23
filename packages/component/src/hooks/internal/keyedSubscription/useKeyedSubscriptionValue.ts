import { useLayoutEffect, useMemo, useState } from 'react';

import { type KeyedSubscription } from './createKeyedSubscription';

/**
 * Returns `[getValue(key)]` and re-renders when its result changes (compared by identity) after `key` is notified.
 *
 * `subscribe` and `getValue` should be stable: a new function re-subscribes.
 */
export default function useKeyedSubscriptionValue<K, T>(
  subscribe: KeyedSubscription<K>['subscribe'],
  key: K,
  getValue: (key: K) => T
): readonly [T] {
  const value = getValue(key);

  // The state only triggers re-renders, React skips them when the same tuple is returned.
  // It holds the key with the value: after a key switch, the state still holds the previous key, so the re-check always re-renders,
  // even if the new key's value has just changed to the previous key's value.
  const [, setState] = useState<readonly [K, T]>(() => Object.freeze([key, value] as const));

  useLayoutEffect(() => {
    const handleChange = () =>
      setState(state => {
        const nextValue = getValue(key);

        return state[0] === key && state[1] === nextValue ? state : Object.freeze([key, nextValue] as const);
      });

    // Catches changes between render and subscription.
    handleChange();

    return subscribe(key, handleChange);
  }, [getValue, key, subscribe]);

  return useMemo(() => Object.freeze([value] as const), [value]);
}
