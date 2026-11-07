import { createReadonlyMap, type ReadWriteMap, type VersionedReadonlyMap } from 'botframework-webchat-store';

/**
 * A writable overlay of the store's persistent map: O(1), and O(changes) to commit. A plain `Map` (e.g. of
 * `INITIAL_STATE`) is converted once, O(n).
 */
export default function mutateMap<K, V>(map: ReadonlyMap<K, V>): ReadWriteMap<K, V> {
  const versioned: VersionedReadonlyMap<K, V> =
    typeof (map as Partial<VersionedReadonlyMap<K, V>>).mutate === 'function'
      ? (map as VersionedReadonlyMap<K, V>)
      : createReadonlyMap(map);

  return versioned.mutate();
}
