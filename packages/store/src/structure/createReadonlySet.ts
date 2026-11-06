import SetView from './SetView.ts';
import { VersionedStorage, type Overlay } from './VersionedStorage.ts';

/**
 * A read-only `Set` which can be mutated via an overlay without copying.
 */
interface VersionedReadonlySet<T> extends ReadonlySet<T> {
  /**
   * Creates a writable overlay on top of this set. Writes go to the overlay, reads go to the overlay first, then this
   * set. This set is not modified, even after the overlay is committed.
   *
   * This is O(1) and does not copy the set.
   */
  mutate(): ReadWriteSet<T>;
}

/**
 * A writable overlay on top of a read-only `Set`.
 */
interface ReadWriteSet<T> extends ReadonlySet<T> {
  add(value: T): this;
  clear(): void;

  /**
   * Commits changes in the overlay and returns a new read-only `Set`. The overlay cannot be modified after.
   *
   * This is O(number of changes) if the underlying set is the latest version (i.e. no other overlay on top of the same
   * set has been committed), otherwise, O(size) as the set is copied.
   */
  commit(): VersionedReadonlySet<T>;
  delete(value: T): boolean;
}

function throwReadonly(): never {
  throw new TypeError('Cannot modify a readonly Set');
}

/**
 * A writable overlay on top of a `ReadonlySetImpl`.
 */
class ReadWriteSetImpl<T> extends SetView<T> implements ReadWriteSet<T> {
  constructor(overlay: Overlay<T, T>) {
    super();

    this.#overlay = overlay;

    Object.freeze(this);
  }

  readonly #overlay: Overlay<T, T>;

  get size(): number {
    return this.#overlay.size;
  }

  add(value: T): this {
    this.#overlay.set(value, value);

    return this;
  }

  clear(): void {
    this.#overlay.clear();
  }

  commit(): VersionedReadonlySet<T> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new ReadonlySetImpl(this.#overlay.commit());
  }

  delete(value: T): boolean {
    return this.#overlay.delete(value);
  }

  has(value: T): boolean {
    return this.#overlay.has(value);
  }

  keys(): SetIterator<T> {
    return this.#overlay.toMap().keys();
  }
}

/**
 * An immutable `Set` backed by a versioned storage.
 *
 * It does not extend `Set`: a subclass of `Set` has the internal slots of a `Set`, which `Set.prototype.add.call()`
 * could modify. Instead, the prototype is chained to `Set.prototype` so `instanceof Set` is `true`, and all read
 * methods are delegated to the storage.
 *
 * Compared to a `Proxy`, method calls are plain property lookups without traps or bound functions.
 */
class ReadonlySetImpl<T> extends SetView<T> implements VersionedReadonlySet<T> {
  constructor(storage: VersionedStorage<T, T>) {
    super();

    this.#storage = storage;

    Object.freeze(this);
  }

  readonly #storage: VersionedStorage<T, T>;

  static isReadonlySet(value: unknown): value is ReadonlySet<unknown> {
    return !!value && typeof value === 'object' && #storage in value;
  }

  get size(): number {
    return this.#storage.size;
  }

  has(value: T): boolean {
    return this.#storage.has(value);
  }

  keys(): SetIterator<T> {
    return this.#storage.toMap().keys();
  }

  mutate(): ReadWriteSet<T> {
    return new ReadWriteSetImpl(this.#storage.mutate());
  }
}

Object.defineProperties(ReadonlySetImpl.prototype, {
  // Mutating methods on `Set.prototype` would throw "incompatible receiver", override them with a clearer error.
  add: { value: throwReadonly },
  clear: { value: throwReadonly },
  delete: { value: throwReadonly }
});

// Some libraries compare `constructor` for equality, e.g. `expect().toEqual()`.
Object.defineProperty(ReadWriteSetImpl.prototype, 'constructor', { value: Set });
Object.freeze(ReadWriteSetImpl.prototype);
Object.freeze(ReadWriteSetImpl);
// Some libraries compare `constructor` for equality, e.g. `expect().toEqual()`.
Object.defineProperty(ReadonlySetImpl.prototype, 'constructor', { value: Set });
Object.freeze(ReadonlySetImpl.prototype);
Object.freeze(ReadonlySetImpl);

/**
 * Checks if the value is a readonly `Set` created by `createReadonlySet()`.
 */
function isReadonlySet(value: unknown): value is ReadonlySet<unknown> {
  return ReadonlySetImpl.isReadonlySet(value);
}

/**
 * Creates an immutable `Set` which cannot be modified.
 *
 * - `instanceof Set` is `true`
 * - `add()`, `clear()`, and `delete()` will throw
 * - `Set.prototype.add.call()` will throw as it does not have the internal slots of a `Set`
 * - Changing properties or prototype will fail
 * - `Object.isFrozen()` is `true`
 * - `mutate()` creates a writable overlay without copying, `commit()` on the overlay returns a new immutable `Set`
 *
 * Note: items are not frozen, freeze them before passing in if needed.
 */
function createReadonlySet<T>(iterable: Iterable<T>): VersionedReadonlySet<T> {
  // Copy into a private storage so changes to the original iterable will not leak in.
  const map = new Map<T, T>();

  // Faster than `new Map(Array.from(iterable, value => [value, value]))` as it does not create tuples.
  for (const value of iterable) {
    map.set(value, value);
  }

  return new ReadonlySetImpl(new VersionedStorage(map));
}

export default createReadonlySet;
export { isReadonlySet, type ReadWriteSet, type VersionedReadonlySet };
