const DELETED: unique symbol = Symbol('deleted');

type Changes<K, V> = Map<K, V | typeof DELETED>;

// Shared by committed overlays, they are never modified as committed overlays cannot be modified.
const EMPTY_CHANGES: Changes<never, never> = new Map<never, never>();
const EMPTY_MAP: Map<never, never> = new Map<never, never>();
const EMPTY_MOVED_KEYS: Set<never> = new Set<never>();

/** Moves the head to a new `Map` when there are more tombstones than this and more than live entries. */
const MIN_NUM_TOMBSTONES_TO_COMPACT = 32;

/**
 * A version which owns an underlying `Map`. Deleted keys are kept as tombstones (`DELETED`) in place. Keys are never
 * reordered in a `Map` once it is shared, so every version sharing it has the same order.
 */
type OwnerState<K, V> = {
  readonly changes?: undefined;
  readonly isHead: boolean;
  readonly map: Map<K, V | typeof DELETED>;
  readonly next?: undefined;
  readonly numTombstones: number;

  /** Content without tombstones, only kept for versions other than the head as they never change. */
  readonly view?: ReadonlyMap<K, V> | undefined;
};

type OlderState<K, V> = {
  /** Changes to apply on top of the next version to get this version. */
  readonly changes: ReadonlyMap<K, V | typeof DELETED>;
  readonly isHead: false;
  readonly map?: undefined;
  readonly next: VersionedStorage<K, V>;
  readonly numTombstones?: undefined;

  /** Content of this version, kept after the first iteration as it never changes. */
  readonly view?: ReadonlyMap<K, V> | undefined;
};

type State<K, V> = OlderState<K, V> | OwnerState<K, V>;

/** Returns a new `Map` of the base with changes applied, tombstones are removed and moved keys are moved to the end. */
function mergeChanges<K, V>(
  base: ReadonlyMap<K, V | typeof DELETED>,
  changes: ReadonlyMap<K, V | typeof DELETED>,
  movedKeys: ReadonlySet<K>
): Map<K, V> {
  const map = new Map<K, V>();

  for (const [key, value] of base) {
    value === DELETED || map.set(key, value);
  }

  for (const [key, value] of changes) {
    (value === DELETED || movedKeys.has(key)) && map.delete(key);
    value === DELETED || map.set(key, value);
  }

  return map;
}

// "Friend" access for `Overlay` to commit into the base version, it is not exposed outside of this module.
let commitChanges: <K, V>(
  base: VersionedStorage<K, V>,
  changes: Changes<K, V>,
  movedKeys: ReadonlySet<K>
) => VersionedStorage<K, V>;

/**
 * A persistent (immutable) key-value storage. A new version can be committed in O(number of changes) without copying.
 *
 * Uses the "rerooting" technique (a.k.a. Baker's trick): only the latest version (head) owns the underlying `Map`.
 * When changes are committed on top of the head, they are written into the underlying `Map` directly. The previous head
 * turns into an older version, which keeps the previous values of the changed keys (undo log) and points to the new head.
 *
 * - Reading the head is O(1)
 * - Reading an older version walks the undo logs towards the head, the walk is compressed for subsequent reads
 * - Iterating an older version is O(size of the underlying `Map`) once, the content is kept for subsequent iterations
 * - Committing on top of the head is O(number of changes)
 * - Copying, O(size): committing on top of an older version (branching), moving a key to the end (setting a key which
 *   is deleted earlier), or when there are more tombstones than live entries (amortized to O(1) per deletion)
 *
 * Why undo log: a read-only version must never change after it is handed out, e.g. `Store.getSnapshot()` returns it
 * directly, and callers (such as `useSyncExternalStore()` or diffing previous/next snapshots) could still read it after
 * the next commit. When committing, the older version must keep its content, the options are:
 *
 * 1. Copy on every commit: every version owns its `Map`, O(size) per commit
 * 2. Forward chain: the new version is "older version + changes", commit is O(number of changes), but reading the head
 *    walks the chain and gets slower on every commit, needs periodic flattening
 * 3. Undo log (this): commit writes into the shared `Map`, the older version keeps the overwritten values
 *
 * Iteration order follows `Map`: keys changed in place keep their position, new keys are appended, and deleted keys
 * which are set again are moved to the end. To keep the order of older versions, a shared `Map` is never reordered:
 * deleted keys are kept as tombstones in place, and moving a key copies to a new `Map` for the head. Iterators are not
 * affected by later commits.
 *
 * Usage: `storage.mutate()` returns a writable `Overlay`, `overlay.commit()` returns a new read-only version. An overlay
 * cannot be used to create another overlay.
 */
class VersionedStorage<K, V> {
  constructor(map: Map<K, V>) {
    this.#size = map.size;
    this.#state = Object.freeze({ isHead: true, map, numTombstones: 0 });
  }

  #size: number;
  #state: State<K, V>;

  static {
    commitChanges = (base, changes, movedKeys) => base.#commit(changes, movedKeys);
  }

  /**
   * Commits changes on top of this version and returns the new version.
   *
   * Takes ownership of `changes`: when committing on the head, it is reused as the undo log to save allocations.
   */
  #commit(changes: Changes<K, V>, movedKeys: ReadonlySet<K>): VersionedStorage<K, V> {
    const state = this.#state;

    if (!changes.size) {
      return this;
    } else if (!state.isHead || !this.#canWriteInPlace(state, changes, movedKeys)) {
      // Copy, this version keeps its underlying `Map` (if any) untouched.
      state.isHead && (this.#state = Object.freeze({ ...state, isHead: false }));

      return new VersionedStorage(mergeChanges(state.map ?? this.toMap(), changes, movedKeys));
    }

    const { map } = state;
    let { numTombstones } = state;

    // Swap in place: apply each change to the map, and replace it with the previous value to become the undo log.
    // Keys are only overwritten in place, the order of the map is not changed.
    for (const [key, value] of changes) {
      changes.set(key, map.has(key) ? (map.get(key) satisfies V | typeof DELETED | undefined as V) : DELETED);
      map.set(key, value);
      value === DELETED && numTombstones++;
    }

    const next = new VersionedStorage<K, V>(EMPTY_MAP);

    next.#size = map.size - numTombstones;
    next.#state = Object.freeze({ isHead: true, map, numTombstones });
    this.#state = Object.freeze({ changes, isHead: false, next });

    return next;
  }

  /** Returns `true` if changes can be written into the underlying `Map` of the head without reordering it. */
  #canWriteInPlace(state: OwnerState<K, V>, changes: Changes<K, V>, movedKeys: ReadonlySet<K>): boolean {
    const { map, numTombstones } = state;

    if (movedKeys.size || (numTombstones > MIN_NUM_TOMBSTONES_TO_COMPACT && numTombstones > this.#size)) {
      return false;
    } else if (!numTombstones) {
      // No tombstones to set.
      return true;
    }

    for (const [key, value] of changes) {
      // Setting a tombstone moves the key to the end.
      if (value !== DELETED && map.get(key) === DELETED) {
        return false;
      }
    }

    return true;
  }

  get size(): number {
    return this.#size;
  }

  /** Compresses the undo logs of an older version, so it points to a version which owns a `Map` directly. */
  #compress(state: OlderState<K, V>): OlderState<K, V> {
    if (state.next.#state.map) {
      return state;
    }

    const changes = new Map(state.changes);
    let { next } = state;

    for (let nextState = next.#state; !nextState.map; nextState = next.#state) {
      for (const [key, value] of nextState.changes) {
        // Changes closer to this version take precedence.
        changes.has(key) || changes.set(key, value);
      }

      ({ next } = nextState);
    }

    return (this.#state = Object.freeze({ ...state, changes, next }));
  }

  get(key: K): V | undefined {
    const state = this.#state;

    if (state.map) {
      const value = state.map.get(key);

      return value === DELETED ? undefined : value;
    } else if (state.view) {
      return state.view.get(key);
    }

    const { changes, next } = this.#compress(state);

    if (changes.has(key)) {
      const change = changes.get(key);

      return change === DELETED ? undefined : change;
    }

    return next.get(key);
  }

  has(key: K): boolean {
    const state = this.#state;

    if (state.map) {
      return state.map.has(key) && state.map.get(key) !== DELETED;
    } else if (state.view) {
      return state.view.has(key);
    }

    const { changes, next } = this.#compress(state);

    return changes.has(key) ? changes.get(key) !== DELETED : next.has(key);
  }

  /**
   * Iterates the content of this version, the iteration is not affected by later commits.
   *
   * @param iterate Iterates a `Map` without tombstones, e.g. `map => map.keys()`.
   * @param project Projects an entry of the underlying `Map` of the head, same as `iterate`, e.g. `key => key`.
   */
  #iterate<T>(iterate: (map: ReadonlyMap<K, V>) => MapIterator<T>, project: (key: K, value: V) => T): MapIterator<T> {
    const state = this.#state;

    // Only the head is modified in place, other versions never change.
    return state.isHead ? this.#iterateHead(state.map, iterate, project) : iterate(this.toMap());
  }

  *#iterateHead<T>(
    map: ReadonlyMap<K, V | typeof DELETED>,
    iterate: (map: ReadonlyMap<K, V>) => MapIterator<T>,
    project: (key: K, value: V) => T
  ): Generator<T, undefined, unknown> {
    let index = 0;

    for (const [key, value] of map) {
      if (!this.#state.isHead) {
        // The underlying `Map` was modified by a later commit, continue on the content of this version.
        const rest = iterate(this.toMap());

        for (let numSkipped = 0; numSkipped < index; numSkipped++) {
          rest.next();
        }

        yield* rest;

        return;
      }

      // Tombstones are skipped.
      if (value !== DELETED) {
        index++;

        yield project(key, value);
      }
    }
  }

  entries(): MapIterator<[K, V]> {
    return this.#iterate(
      map => map.entries(),
      (key, value) => [key, value]
    );
  }

  keys(): MapIterator<K> {
    return this.#iterate(
      map => map.keys(),
      key => key
    );
  }

  values(): MapIterator<V> {
    return this.#iterate(
      map => map.values(),
      (_, value) => value
    );
  }

  /**
   * Creates a writable overlay on top of this version, O(1). This version is not modified, even after the overlay is
   * committed.
   */
  mutate(): Overlay<K, V> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new Overlay(this);
  }

  /**
   * Returns the content of this version as a `Map`, it must not be modified.
   *
   * For the head, returns the underlying `Map` in O(1) if there are no tombstones, otherwise, a copy in O(size). The
   * underlying `Map` is modified by later commits, use `entries()`, `keys()`, or `values()` for iteration instead.
   *
   * For other versions, the content is reconstructed once in O(size of the underlying `Map`) and kept, subsequent calls
   * are O(1).
   */
  toMap(): ReadonlyMap<K, V> {
    const state = this.#state;

    if (state.view) {
      return state.view;
    } else if (state.isHead && !state.numTombstones) {
      return state.map satisfies ReadonlyMap<K, V | typeof DELETED> as ReadonlyMap<K, V>;
    } else if (state.isHead) {
      return mergeChanges(state.map, EMPTY_CHANGES, EMPTY_MOVED_KEYS);
    }

    let view: Map<K, V>;

    if (state.map) {
      view = mergeChanges(state.map, EMPTY_CHANGES, EMPTY_MOVED_KEYS);
    } else {
      // The underlying `Map` is never reordered, the order of this version is the same, without keys absent here.
      const compressed = this.#compress(state);

      view = new Map();

      for (const key of (compressed.next.#state.map satisfies Map<K, unknown> | undefined as Map<K, unknown>).keys()) {
        this.has(key) && view.set(key, this.get(key) satisfies V | undefined as V);
      }
    }

    // Keeps the content, older versions never change. The undo logs are kept for older versions referring to this one.
    this.#state = Object.freeze({ ...this.#state, view });

    return view;
  }
}

/**
 * A writable overlay on top of a version of a `VersionedStorage`, created by `VersionedStorage.mutate()`. Writes go to
 * the overlay, reads go to the overlay first, then the base version. The base version is not modified, `commit()`
 * returns a new version.
 */
class Overlay<K, V> {
  constructor(base: VersionedStorage<K, V>) {
    this.#base = base;
    this.#size = base.size;
  }

  #base: VersionedStorage<K, V>;
  #changes: Changes<K, V> = new Map();
  #committed = false;

  /** Keys in the base version which are deleted then set again, they are moved to the end as `Map` does. */
  #movedKeys: Set<K> = new Set();
  #size: number;

  #assertNotCommitted(): void {
    if (this.#committed) {
      throw new Error('Changes are already committed, it cannot be modified');
    }
  }

  get size(): number {
    return this.#size;
  }

  get(key: K): V | undefined {
    if (this.#changes.has(key)) {
      const change = this.#changes.get(key);

      return change === DELETED ? undefined : change;
    }

    return this.#base.get(key);
  }

  has(key: K): boolean {
    return this.#changes.has(key) ? this.#changes.get(key) !== DELETED : this.#base.has(key);
  }

  set(key: K, value: V): void {
    this.#assertNotCommitted();

    this.has(key) || this.#size++;

    if (this.#changes.has(key) && this.#changes.get(key) === DELETED) {
      // Re-append so the key is ordered after other new keys.
      this.#changes.delete(key);
      this.#movedKeys.add(key);
    }

    this.#changes.set(key, value);
  }

  delete(key: K): boolean {
    this.#assertNotCommitted();

    if (!this.has(key)) {
      return false;
    }

    this.#base.has(key) ? this.#changes.set(key, DELETED) : this.#changes.delete(key);
    this.#movedKeys.delete(key);
    this.#size--;

    return true;
  }

  clear(): void {
    this.#assertNotCommitted();

    for (const key of this.toMap().keys()) {
      this.delete(key);
    }
  }

  /**
   * Commits the changes on top of the base version and returns the new version. The overlay cannot be modified after.
   */
  commit(): VersionedStorage<K, V> {
    this.#assertNotCommitted();

    this.#committed = true;

    // `commitChanges` takes ownership of the changes, after commit, reads go to the committed version.
    this.#base = commitChanges(this.#base, this.#changes, this.#movedKeys);
    this.#changes = EMPTY_CHANGES;
    this.#movedKeys = EMPTY_MOVED_KEYS;

    return this.#base;
  }

  /**
   * Returns the content as a new `Map`, O(size).
   */
  toMap(): ReadonlyMap<K, V> {
    return mergeChanges(this.#base.toMap(), this.#changes, this.#movedKeys);
  }
}

Object.freeze(Overlay.prototype);
Object.freeze(Overlay);
Object.freeze(VersionedStorage.prototype);
Object.freeze(VersionedStorage);

export { VersionedStorage, type Overlay };
