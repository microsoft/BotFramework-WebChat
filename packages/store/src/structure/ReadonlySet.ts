import SetView from './SetView.ts';
import { VersionedStorage, type Overlay } from './VersionedStorage.ts';

/**
 * A writable overlay on top of a read-only `Set`.
 */
interface ReadWriteSet<T> extends globalThis.ReadonlySet<T> {
  add(value: T): this;
  clear(): void;

  /**
   * Commits changes in the overlay and returns a new read-only `Set`. The overlay cannot be modified after.
   *
   * This is O(number of changes) if the underlying set is the latest version (i.e. no other overlay on top of the same
   * set has been committed), otherwise, O(size) as the set is copied.
   */
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  commit(): ReadonlySet<T>;
  delete(value: T): boolean;
}

function throwReadonly(): never {
  throw new TypeError('Cannot modify a readonly Set');
}

/**
 * A writable overlay on top of a `ReadonlySet`.
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

  commit(): ReadonlySet<T> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return fromStorage(this.#overlay.commit());
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

/** Copies into a private storage so changes to the original iterable will not leak in. */
function toStorage<T>(iterable: Iterable<T> | null | undefined): VersionedStorage<T, T> {
  const map = new Map<T, T>();

  // Faster than `new Map(Array.from(iterable, value => [value, value]))` as it does not create tuples.
  for (const value of iterable ?? []) {
    map.set(value, value);
  }

  return new VersionedStorage(map);
}

/** Storage handed to the next `ReadonlySet` constructor, only set by `fromStorage()` during construction. */
let nextStorage: VersionedStorage<unknown, unknown> | undefined;

/**
 * An immutable `Set` which cannot be modified.
 *
 * - `instanceof Set` is `true`
 * - `add()`, `clear()`, and `delete()` will throw
 * - `Set.prototype.add.call()` will throw as it does not have the internal slots of a `Set`
 * - Changing properties or prototype will fail
 * - `Object.isFrozen()` is `true`
 * - `mutate()` creates a writable overlay without copying, `commit()` on the overlay returns a new immutable `Set`
 *
 * It does not extend `Set`: a subclass of `Set` has the internal slots of a `Set`, which `Set.prototype.add.call()`
 * could modify. Instead, the prototype is chained to `Set.prototype` so `instanceof Set` is `true`, and all read
 * methods are delegated to the storage.
 *
 * Compared to a `Proxy`, method calls are plain property lookups without traps or bound functions.
 *
 * Note: items are not frozen, freeze them before passing in if needed.
 */
class ReadonlySet<T> extends SetView<T> {
  constructor(iterable?: Iterable<T> | null | undefined) {
    super();

    const storage = nextStorage;

    nextStorage = undefined;

    this.#storage = storage
      ? (storage satisfies VersionedStorage<unknown, unknown> as VersionedStorage<T, T>)
      : toStorage(iterable);

    Object.freeze(this);
  }

  readonly #storage: VersionedStorage<T, T>;

  static isReadonlySet(value: unknown): value is globalThis.ReadonlySet<unknown> {
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

  /**
   * Creates a writable overlay on top of this set. Writes go to the overlay, reads go to the overlay first, then this
   * set. This set is not modified, even after the overlay is committed.
   *
   * This is O(1) and does not copy the set.
   */
  mutate(): ReadWriteSet<T> {
    return new ReadWriteSetImpl(this.#storage.mutate());
  }
}

/** Creates a `ReadonlySet` backed by the storage without copying. */
function fromStorage<T>(storage: VersionedStorage<T, T>): ReadonlySet<T> {
  nextStorage = storage;

  try {
    return new ReadonlySet<T>();
  } finally {
    nextStorage = undefined;
  }
}

Object.defineProperties(ReadonlySet.prototype, {
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
Object.defineProperty(ReadonlySet.prototype, 'constructor', { value: Set });
Object.freeze(ReadonlySet.prototype);
Object.freeze(ReadonlySet);

/**
 * Checks if the value is a `ReadonlySet`.
 */
function isReadonlySet(value: unknown): value is globalThis.ReadonlySet<unknown> {
  return ReadonlySet.isReadonlySet(value);
}

export default ReadonlySet;
export { isReadonlySet, type ReadWriteSet };
