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

  // The state only triggers re-renders, React skips them when the value did not change.
  // Function forms: React would call a function `T` as an initializer or updater.
  const [, setValue] = useState<T>(() => value);

  useLayoutEffect(() => {
    const handleChange = () => setValue(() => getValue(key));

    // Catches changes between render and subscription.
    handleChange();

    return subscribe(key, handleChange);
  }, [getValue, key, subscribe]);

  return useMemo(() => Object.freeze([value] as const), [value]);
}
