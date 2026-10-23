type KeyedSubscription<K> = {
  /** Calls the listeners of each key. Call it after commit (e.g. from an effect), as listeners may re-render. */
  readonly notify: (keys: Iterable<K>) => void;
  /** Calls the listeners of every subscribed key, for a change that affects all keys. Call it after commit, as `notify()`. */
  readonly notifyAll: () => void;
  /** Calls the listener when the key is notified, until unsubscribed. */
  readonly subscribe: (key: K, listener: () => void) => () => void;
};

/** Creates a store of listeners by key, so a change notifies only the listeners interested in it. */
export default function createKeyedSubscription<K>(): KeyedSubscription<K> {
  const listenersByKey = new Map<K, Set<() => void>>();

  const notify = (keys: Iterable<K>) => {
    for (const key of new Set(keys)) {
      // Copies the listeners: a listener may unsubscribe while being notified.
      for (const listener of Array.from(listenersByKey.get(key) ?? [])) {
        listener();
      }
    }
  };

  return Object.freeze({
    notify,
    // Copies the keys: a listener may subscribe or unsubscribe while being notified.
    notifyAll: () => notify(Array.from(listenersByKey.keys())),
    subscribe: (key: K, listener: () => void) => {
      const listeners = listenersByKey.get(key) ?? new Set();

      listeners.add(listener);
      listenersByKey.set(key, listeners);

      return () => {
        listeners.delete(listener);

        // Deletes only this set: after it emptied, a later subscribe may have put a new set under the same key.
        !listeners.size && listenersByKey.get(key) === listeners && listenersByKey.delete(key);
      };
    }
  });
}

export { type KeyedSubscription };
