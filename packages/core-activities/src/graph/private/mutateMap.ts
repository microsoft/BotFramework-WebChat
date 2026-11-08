import { FrozenMap, type ReadWriteMap } from 'botframework-webchat-store/structure';

/**
 * A writable overlay of the store's persistent map: O(1), and O(changes) to commit. A plain `Map` (e.g. of
 * `INITIAL_STATE`) is converted once, O(n).
 */
export default function mutateMap<K, V>(map: ReadonlyMap<K, V>): ReadWriteMap<K, V> {
  const frozen: FrozenMap<K, V> =
    typeof (map as Partial<FrozenMap<K, V>>).mutate === 'function' ? (map as FrozenMap<K, V>) : new FrozenMap(map);

  return frozen.mutate();
}
