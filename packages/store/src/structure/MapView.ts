/**
 * Implements common read methods of a `Map`, and makes `instanceof Map` `true`.
 */
abstract class MapView<K, V> implements ReadonlyMap<K, V> {
  abstract get size(): number;
  abstract entries(): MapIterator<[K, V]>;
  abstract get(key: K): V | undefined;
  abstract has(key: K): boolean;
  abstract keys(): MapIterator<K>;
  abstract values(): MapIterator<V>;

  forEach(callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: unknown): void {
    for (const [key, value] of this.entries()) {
      callbackfn.call(thisArg, value, key, this);
    }
  }

  [Symbol.iterator](): MapIterator<[K, V]> {
    return this.entries();
  }
}

// `instanceof Map` should be `true`.
Object.setPrototypeOf(MapView.prototype, Map.prototype);

Object.defineProperties(MapView.prototype, {
  [Symbol.toStringTag]: { value: 'Map' }
});

Object.freeze(MapView.prototype);
Object.freeze(MapView);

export default MapView;
