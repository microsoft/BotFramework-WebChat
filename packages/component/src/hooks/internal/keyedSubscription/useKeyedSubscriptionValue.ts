import { useLayoutEffect, useMemo, useReducer, useRef } from 'react';

import { type KeyedSubscription } from './createKeyedSubscription';

function increment(value: number): number {
  return value + 1;
}

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
  const [, forceRender] = useReducer(increment, 0);

  const value = getValue(key);
  const valueRef = useRef<T>(value);

  useLayoutEffect(() => {
    valueRef.current = value;
  });

  useLayoutEffect(() => {
    const handleChange = () => {
      const nextValue = getValue(key);

      if (nextValue !== valueRef.current) {
        // Remembers the new value now, so another notification before the re-render does not re-render again.
        valueRef.current = nextValue;

        forceRender();
      }
    };

    // Catches changes between render and subscription.
    handleChange();

    return subscribe(key, handleChange);
  }, [forceRender, getValue, key, subscribe, valueRef]);

  return useMemo(() => Object.freeze([value] as const), [value]);
}
