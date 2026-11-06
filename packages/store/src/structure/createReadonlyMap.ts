import MapView from './MapView.ts';
import { Overlay, VersionedStorage } from './VersionedStorage.ts';

/**
 * A read-only `Map` which can be mutated via an overlay without copying.
 */
interface VersionedReadonlyMap<K, V> extends ReadonlyMap<K, V> {
  /**
   * Creates a writable overlay on top of this map. Writes go to the overlay, reads go to the overlay first, then this
   * map. This map is not modified, even after the overlay is committed.
   *
   * This is O(1) and does not copy the map.
   */
  mutate(): ReadWriteMap<K, V>;
}

/**
 * A writable overlay on top of a read-only `Map`.
 */
interface ReadWriteMap<K, V> extends ReadonlyMap<K, V> {
  clear(): void;

  /**
   * Commits changes in the overlay and returns a new read-only `Map`. The overlay cannot be modified after.
   *
   * This is O(number of changes) if the underlying map is the latest version (i.e. no other overlay on top of the same
   * map has been committed), otherwise, O(size) as the map is copied.
   */
  commit(): VersionedReadonlyMap<K, V>;
  delete(key: K): boolean;
  set(key: K, value: V): this;
}

function throwReadonly(): never {
  throw new TypeError('Cannot modify a readonly Map');
}

/**
 * A writable overlay on top of a `ReadonlyMapImpl`.
 */
class ReadWriteMapImpl<K, V> extends MapView<K, V> implements ReadWriteMap<K, V> {
  constructor(overlay: Overlay<K, V>) {
    super();

    this.#overlay = overlay;

    Object.freeze(this);
  }

  readonly #overlay: Overlay<K, V>;

  get size(): number {
    return this.#overlay.size;
  }

  clear(): void {
    this.#overlay.clear();
  }

  commit(): VersionedReadonlyMap<K, V> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new ReadonlyMapImpl(this.#overlay.commit());
  }

  delete(key: K): boolean {
    return this.#overlay.delete(key);
  }

  entries(): MapIterator<[K, V]> {
    return this.#overlay.toMap().entries();
  }

  get(key: K): V | undefined {
    return this.#overlay.get(key);
  }

  has(key: K): boolean {
    return this.#overlay.has(key);
  }

  keys(): MapIterator<K> {
    return this.#overlay.toMap().keys();
  }

  set(key: K, value: V): this {
    this.#overlay.set(key, value);

    return this;
  }

  values(): MapIterator<V> {
    return this.#overlay.toMap().values();
  }
}

/**
 * An immutable `Map` backed by a versioned storage.
 *
 * Similar to `createReadonlySet()`, it does not extend `Map` but its prototype is chained to `Map.prototype`.
 */
class ReadonlyMapImpl<K, V> extends MapView<K, V> implements VersionedReadonlyMap<K, V> {
  constructor(storage: VersionedStorage<K, V>) {
    super();

    this.#storage = storage;

    Object.freeze(this);
  }

  readonly #storage: VersionedStorage<K, V>;

  static isReadonlyMap(value: unknown): value is ReadonlyMap<unknown, unknown> {
    return !!value && typeof value === 'object' && #storage in value;
  }

  get size(): number {
    return this.#storage.size;
  }

  entries(): MapIterator<[K, V]> {
    return this.#storage.toMap().entries();
  }

  get(key: K): V | undefined {
    return this.#storage.get(key);
  }

  has(key: K): boolean {
    return this.#storage.has(key);
  }

  keys(): MapIterator<K> {
    return this.#storage.toMap().keys();
  }

  mutate(): ReadWriteMap<K, V> {
    return new ReadWriteMapImpl(new Overlay(this.#storage));
  }

  values(): MapIterator<V> {
    return this.#storage.toMap().values();
  }
}

Object.defineProperties(ReadonlyMapImpl.prototype, {
  // Mutating methods on `Map.prototype` would throw "incompatible receiver", override them with a clearer error.
  clear: { value: throwReadonly },
  delete: { value: throwReadonly },
  set: { value: throwReadonly }
});

// Some libraries compare `constructor` for equality, e.g. `expect().toEqual()`.
Object.defineProperty(ReadWriteMapImpl.prototype, 'constructor', { value: Map });
Object.freeze(ReadWriteMapImpl.prototype);
Object.freeze(ReadWriteMapImpl);
// Some libraries compare `constructor` for equality, e.g. `expect().toEqual()`.
Object.defineProperty(ReadonlyMapImpl.prototype, 'constructor', { value: Map });
Object.freeze(ReadonlyMapImpl.prototype);
Object.freeze(ReadonlyMapImpl);

/**
 * Checks if the value is a readonly `Map` created by `createReadonlyMap()`.
 */
function isReadonlyMap(value: unknown): value is ReadonlyMap<unknown, unknown> {
  return ReadonlyMapImpl.isReadonlyMap(value);
}

/**
 * Creates an immutable `Map` which cannot be modified.
 *
 * - `instanceof Map` is `true`
 * - `clear()`, `delete()`, and `set()` will throw
 * - `Map.prototype.set.call()` will throw as it does not have the internal slots of a `Map`
 * - `Object.isFrozen()` is `true`
 * - `mutate()` creates a writable overlay without copying, `commit()` on the overlay returns a new immutable `Map`
 *
 * Note: keys and values are not frozen, freeze them before passing in if needed.
 */
function createReadonlyMap<K, V>(iterable: Iterable<readonly [K, V]>): VersionedReadonlyMap<K, V> {
  // Copy into a private storage so changes to the original iterable will not leak in.
  return new ReadonlyMapImpl(new VersionedStorage(new Map(iterable)));
}

export default createReadonlyMap;
export { isReadonlyMap, type ReadWriteMap, type VersionedReadonlyMap };
