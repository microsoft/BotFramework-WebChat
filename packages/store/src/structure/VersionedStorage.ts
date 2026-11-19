const DELETED: unique symbol = Symbol('deleted');

type Changes<K, V> = Map<K, V | typeof DELETED>;

// Shared by committed overlays, they are never modified as committed overlays cannot be modified.
const EMPTY_CHANGES: Changes<never, never> = new Map<never, never>();
const EMPTY_MAP: Map<never, never> = new Map<never, never>();
const EMPTY_MOVED_KEYS: Set<never> = new Set<never>();
const EMPTY_POSITIONS: readonly never[] = Object.freeze([]);

const ORDERED: VersionedStorageInit = Object.freeze({ ordered: true });
const UNORDERED: VersionedStorageInit = Object.freeze({ ordered: false });

/** Compacts the underlying `Map` of the head when there are more tombstones than this and more than live entries. */
const MIN_NUM_TOMBSTONES_TO_COMPACT = 32;

/**
 * A version which owns an underlying `Map`. Keys deleted from the head are kept as tombstones (`DELETED`) in place, so
 * older versions can reconstruct their iteration order without searching for deleted keys.
 */
type OwnerState<K, V> = {
  readonly changes?: undefined;
  readonly isHead: boolean;
  readonly map: Map<K, V | typeof DELETED>;
  readonly next?: undefined;
  readonly numPhysicalKeys?: undefined;
  readonly numTombstones: number;
  readonly orderNext?: undefined;
  readonly positions?: undefined;

  /** Content without tombstones, only kept for versions other than the head as they never change. */
  readonly view?: ReadonlyMap<K, V> | undefined;
};

type OlderState<K, V> = {
  /** Changes to apply on top of the next version to get this version. */
  readonly changes: ReadonlyMap<K, V | typeof DELETED>;
  readonly isHead: false;
  readonly map?: undefined;
  readonly next: VersionedStorage<K, V>;

  /** Number of keys in the underlying `Map` of this version, including tombstones. */
  readonly numPhysicalKeys: number;
  readonly numTombstones?: undefined;

  /** The version committed on top of this version, unlike `next`, it is never compressed. */
  readonly orderNext: VersionedStorage<K, V>;

  /**
   * Keys moved to the end by the commit on top of this version, with their positions in the underlying `Map` of this
   * version, sorted by position.
   */
  readonly positions: readonly (readonly [number, K])[];
  readonly view?: undefined;
};

type State<K, V> = OlderState<K, V> | OwnerState<K, V>;

type VersionedStorageInit = {
  /**
   * Keeps the iteration order of older versions, defaults to `true`.
   *
   * When `false`, deleted keys are removed from the underlying `Map` instead of kept as tombstones, and moving keys
   * skips recording their positions. Older versions still have the same content, but their iteration order is
   * unspecified.
   */
  readonly ordered?: boolean | undefined;
};

/**
 * Applies changes to the map in place, moved keys are deleted and set again so they are moved to the end.
 */
function applyChanges<K, V>(
  map: Map<K, V>,
  changes: ReadonlyMap<K, V | typeof DELETED>,
  movedKeys: ReadonlySet<K>
): void {
  for (const [key, value] of changes) {
    if (value === DELETED) {
      map.delete(key);
    } else {
      movedKeys.has(key) && map.delete(key);
      map.set(key, value);
    }
  }
}

/**
 * Returns a new `Map` with changes applied on top of the base, tombstones in the base are skipped.
 *
 * Keys changed in place keep their position, new keys and moved keys are appended.
 */
function mergeChanges<K, V>(
  base: ReadonlyMap<K, V | typeof DELETED>,
  changes: ReadonlyMap<K, V | typeof DELETED>,
  movedKeys: ReadonlySet<K>
): Map<K, V> {
  const map = new Map<K, V>();

  for (const [key, value] of base) {
    const change = changes.has(key) ? changes.get(key) : value;

    change === DELETED || (changes.has(key) && movedKeys.has(key)) || map.set(key, change satisfies V | undefined as V);
  }

  for (const [key, change] of changes) {
    change === DELETED || (!movedKeys.has(key) && base.has(key) && base.get(key) !== DELETED) || map.set(key, change);
  }

  return map;
}

/**
 * Returns keys which will be moved to the end of the underlying `Map`: keys set again after deleted in the same overlay,
 * or deleted in an earlier commit (tombstones).
 */
function getPhysicallyMovedKeys<K, V>(
  map: ReadonlyMap<K, V | typeof DELETED>,
  changes: ReadonlyMap<K, V | typeof DELETED>,
  movedKeys: ReadonlySet<K>
): ReadonlySet<K> {
  let physicallyMovedKeys: Set<K> | undefined;

  for (const [key, value] of changes) {
    value === DELETED ||
      ((movedKeys.has(key) || (map.has(key) && map.get(key) === DELETED)) &&
        (physicallyMovedKeys ??= new Set()).add(key));
  }

  return physicallyMovedKeys ?? EMPTY_MOVED_KEYS;
}

/** Finds positions of the keys in the map, O(size). Returns them sorted by position. */
function findPositions<K>(map: ReadonlyMap<K, unknown>, keys: ReadonlySet<K>): readonly (readonly [number, K])[] {
  if (!keys.size) {
    return EMPTY_POSITIONS;
  }

  const positions: (readonly [number, K])[] = [];
  let position = 0;

  for (const key of map.keys()) {
    keys.has(key) && positions.push(Object.freeze([position, key] as const));

    if (positions.length === keys.size) {
      break;
    }

    position++;
  }

  return Object.freeze(positions);
}

/** Returns a new `Map` without tombstones. */
function withoutTombstones<K, V>(map: ReadonlyMap<K, V | typeof DELETED>): Map<K, V> {
  return mergeChanges(map, EMPTY_CHANGES, EMPTY_MOVED_KEYS);
}

// "Friend" access for `Overlay` to commit into the base version, it is not exposed outside of this module.
let commitChanges: <K, V>(
  base: VersionedStorage<K, V>,
  changes: Changes<K, V>,
  movedKeys: ReadonlySet<K>
) => VersionedStorage<K, V>;

// Size and state handed to the next `VersionedStorage` constructor, only set by `#fromState()` during construction.
let nextSize: number = 0;
let nextState: OwnerState<unknown, unknown> | undefined;

/**
 * A persistent (immutable) key-value storage. A new version can be committed in O(number of changes) without copying.
 *
 * Uses the "rerooting" technique (a.k.a. Baker's trick): only the latest version (head) owns the underlying `Map`.
 * When changes are committed on top of the head, they are written into the underlying `Map` directly. The previous head
 * turns into an older version, which keeps the previous values of the changed keys (undo log) and points to the new head.
 *
 * - Reading the head is O(1)
 * - Reading an older version walks the undo logs towards the head, the walk is compressed for subsequent reads
 * - Committing on top of an older version (branching) copies the whole storage, O(size)
 * - Committing on top of the head is O(number of changes), plus O(size) when moving keys to the end, i.e. setting a key
 *   which is deleted in the same overlay or in an earlier commit, unless `ordered` is `false`
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
 * The undo log keeps the hot path cheap (reading the head in O(1) and committing in O(number of changes)), and moves the
 * cost to the rare path (reading or branching from an older version).
 *
 * Iteration order follows `Map`: keys changed in place keep their position, new keys are appended, and deleted keys
 * which are set again are moved to the end. Older versions keep their order after later commits, iterators are not
 * affected by later commits.
 *
 * To keep the order of older versions, deleted keys are kept as tombstones in the underlying `Map` of the head. When
 * there are more tombstones than live entries, the head moves to a new `Map` without tombstones, O(size) amortized to
 * O(1) per deletion.
 *
 * Usage: `storage.mutate()` returns a writable `Overlay`, `overlay.commit()` returns a new read-only version. An overlay
 * cannot be used to create another overlay.
 */
class VersionedStorage<K, V> {
  constructor(map: Map<K, V>, init?: VersionedStorageInit | undefined) {
    const state = nextState;

    nextState = undefined;

    this.#ordered = init?.ordered ?? true;

    if (state) {
      this.#size = nextSize;
      this.#state = state satisfies OwnerState<unknown, unknown> as OwnerState<K, V>;
    } else {
      this.#size = map.size;
      this.#state = Object.freeze({
        isHead: true,
        map,
        numTombstones: 0
      });
    }
  }

  readonly #ordered: boolean;
  readonly #size: number;
  #state: State<K, V>;

  static {
    commitChanges = (base, changes, movedKeys) => base.#commit(changes, movedKeys);
  }

  /** Creates a version which owns the underlying `Map` of the state. */
  #fromState(size: number, state: OwnerState<K, V>): VersionedStorage<K, V> {
    nextSize = size;
    nextState = Object.freeze(state);

    try {
      // The map is ignored when the size and state are handed over.
      return new VersionedStorage(EMPTY_MAP, this.#ordered ? ORDERED : UNORDERED);
    } finally {
      nextState = undefined;
    }
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
    } else if (!state.isHead) {
      // This version is not the head (branching), copy it.
      const nextMap = new Map(this.toMap());

      applyChanges(nextMap, changes, movedKeys);

      return new VersionedStorage(nextMap, this.#ordered ? ORDERED : UNORDERED);
    }

    const { map } = state;
    const numPhysicalKeys = map.size;
    const physicallyMovedKeys = getPhysicallyMovedKeys(map, changes, movedKeys);
    // Before modifying the map, find positions of keys which will be moved, so `toMap()` of this version can put them
    // back to their original positions.
    const positions = this.#ordered ? findPositions(map, physicallyMovedKeys) : EMPTY_POSITIONS;
    let { numTombstones } = state;

    // Swap in place: apply each change to the map, and replace it with the previous value to become the undo log.
    // Overwriting an existing key while iterating does not reorder or revisit entries.
    for (const [key, value] of changes) {
      const previous = map.has(key)
        ? (map.get(key) satisfies V | typeof DELETED | undefined as V | typeof DELETED)
        : DELETED;

      if (value !== DELETED) {
        if (physicallyMovedKeys.has(key)) {
          previous === DELETED && numTombstones--;
          map.delete(key);
        }

        map.set(key, value);
      } else if (this.#ordered) {
        // Keeps the deleted key as a tombstone, so older versions can reconstruct their order.
        map.set(key, DELETED);
        numTombstones++;
      } else {
        map.delete(key);
      }

      changes.set(key, previous);
    }

    const size = map.size - numTombstones;
    // Too many tombstones, the head moves to a new `Map`. The current `Map` is kept by a version with the same content as
    // the head, so older versions can still reconstruct their order from it.
    const shouldCompact = numTombstones > MIN_NUM_TOMBSTONES_TO_COMPACT && numTombstones > size;
    const next = this.#fromState(size, { isHead: !shouldCompact, map, numTombstones });
    const head = shouldCompact
      ? this.#fromState(size, { isHead: true, map: withoutTombstones(map), numTombstones: 0 })
      : next;

    this.#state = Object.freeze({
      changes,
      isHead: false,
      next,
      numPhysicalKeys,
      orderNext: next,
      positions
    });

    return head;
  }

  get size(): number {
    return this.#size;
  }

  /**
   * Compresses the undo logs of an older version, so it points to a version which owns a `Map` directly.
   */
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

    // Only the head is modified in place, other versions never change. An empty map never changes.
    return state.isHead && this.#size
      ? this.#iterateHead(state.map, iterate, project)
      : iterate(this.#size ? this.toMap() : EMPTY_MAP);
  }

  *#iterateHead<T>(
    map: ReadonlyMap<K, V | typeof DELETED>,
    iterate: (map: ReadonlyMap<K, V>) => MapIterator<T>,
    project: (key: K, value: V) => T
  ): Generator<T, undefined, unknown> {
    const iterator = map.entries();

    for (let index = 0; ; ) {
      if (!this.#state.isHead) {
        // The underlying `Map` was modified by a later commit, continue on the content of this version.
        const rest = iterate(this.toMap());

        for (let numSkipped = 0; numSkipped < index; numSkipped++) {
          rest.next();
        }

        yield* rest;

        return;
      }

      const result = iterator.next();

      if (result.done) {
        return;
      }

      const [key, value] = result.value;

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
   * For an older version, the content is reconstructed once in O(size × number of commits moving keys) and kept,
   * subsequent calls are O(1).
   */
  toMap(): ReadonlyMap<K, V> {
    const state = this.#state;

    if (state.map) {
      if (!state.numTombstones) {
        return state.map satisfies ReadonlyMap<K, V | typeof DELETED> as ReadonlyMap<K, V>;
      } else if (state.isHead) {
        return withoutTombstones(state.map);
      }

      // Older versions never change, keep the content.
      const view = state.view ?? withoutTombstones(state.map);

      this.#state = Object.freeze({ ...state, view });

      return view;
    }

    if (!this.#ordered) {
      const { changes, next } = this.#compress(state);
      const map = mergeChanges(next.#physicalMap(), changes, EMPTY_MOVED_KEYS);

      this.#materialize(map, 0, map);

      return map;
    }

    // Walk the order logs towards the nearest version which owns a `Map`.
    const olderStates: OlderState<K, V>[] = [state];
    let baseMap: ReadonlyMap<K, V | typeof DELETED>;

    for (let version = state.orderNext; ; ) {
      const versionState = version.#state;

      if (versionState.map) {
        baseMap = versionState.map;

        break;
      }

      olderStates.push(versionState);
      version = versionState.orderNext;
    }

    // Walk back towards this version to reconstruct keys of the underlying `Map` of every version: moved keys are put
    // back to their original positions, keys appended later are removed.
    let keys: readonly K[] = Array.from(baseMap.keys());

    for (const { numPhysicalKeys, positions } of olderStates.reverse()) {
      const remainingKeys = keys.slice(0, numPhysicalKeys - positions.length);

      if (positions.length) {
        const nextKeys: K[] = [];
        let remainingIndex = 0;

        for (const [position, key] of positions) {
          while (nextKeys.length < position) {
            nextKeys.push(remainingKeys[remainingIndex++] satisfies K | undefined as K);
          }

          nextKeys.push(key);
        }

        keys = [...nextKeys, ...remainingKeys.slice(remainingIndex)];
      } else {
        keys = remainingKeys;
      }
    }

    // Keeps the underlying `Map` of this version with tombstones, as order logs of older versions refer to its keys.
    const physicalMap = new Map<K, V | typeof DELETED>();
    const view = new Map<K, V>();

    for (const key of keys) {
      if (this.has(key)) {
        const value = this.get(key) satisfies V | undefined as V;

        physicalMap.set(key, value);
        view.set(key, value);
      } else {
        physicalMap.set(key, DELETED);
      }
    }

    this.#materialize(physicalMap, physicalMap.size - view.size, view);

    return view;
  }

  /** Returns the underlying `Map` of a version which owns it, including tombstones. */
  #physicalMap(): ReadonlyMap<K, V | typeof DELETED> {
    const { map } = this.#state;

    if (!map) {
      throw new Error('This version does not own a map');
    }

    return map;
  }

  /**
   * Keeps the content of this older version, so subsequent reads are O(1) and later versions can be released. Older
   * versions never change.
   */
  #materialize(map: Map<K, V | typeof DELETED>, numTombstones: number, view: ReadonlyMap<K, V>): void {
    this.#state = Object.freeze({
      isHead: false,
      map,
      numTombstones,
      view
    });
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
    return this.#changes.size
      ? mergeChanges(this.#base.toMap(), this.#changes, this.#movedKeys)
      : new Map(this.#base.toMap());
  }
}

Object.freeze(Overlay.prototype);
Object.freeze(Overlay);
Object.freeze(VersionedStorage.prototype);
Object.freeze(VersionedStorage);

export { VersionedStorage, type Overlay, type VersionedStorageInit };
