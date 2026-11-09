import { useSyncExternalStore } from '@msinternal/botframework-webchat-react-hooks';
import { useCallback, useMemo } from 'react';

import { type ReadonlyKeyedStore } from './createKeyedStore';

/**
 * Returns the value of the key in the store, and re-renders when it changes.
 */
export default function useKeyedStoreValue<T>(store: ReadonlyKeyedStore<T>, key: string): readonly [T | undefined] {
  const value = useSyncExternalStore(
    useCallback(listener => store.subscribe(key, listener), [key, store]),
    useCallback(() => store.get(key), [key, store])
  );

  return useMemo(() => Object.freeze([value] as const), [value]);
}
