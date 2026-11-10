const DELETED: unique symbol = Symbol('deleted');

type Changes<K, V> = Map<K, V | typeof DELETED>;

// Shared by committed overlays, it is never modified as committed overlays cannot be modified.
const EMPTY_CHANGES: Changes<never, never> = new Map<never, never>();

type HeadState<K, V> = {
  readonly changes: undefined;
  readonly map: Map<K, V>;
  readonly next: undefined;
};

type OlderState<K, V> = {
  /** Changes to apply on top of the next version to get this version. */
  readonly changes: ReadonlyMap<K, V | typeof DELETED>;
  readonly map: undefined;
  readonly next: VersionedStorage<K, V>;
};

function applyChanges<K, V>(map: Map<K, V>, changes: ReadonlyMap<K, V | typeof DELETED>): void {
  for (const [key, value] of changes) {
    value === DELETED ? map.delete(key) : map.set(key, value);
  }
}

/**
 * Returns a new `Map` with changes applied on top of the base.
 *
 * Keys changed in place keep their position, new keys are appended.
 */
function mergeChanges<K, V>(base: ReadonlyMap<K, V>, changes: ReadonlyMap<K, V | typeof DELETED>): Map<K, V> {
  const map = new Map<K, V>();

  for (const [key, value] of base) {
    if (changes.has(key)) {
      const change = changes.get(key);

      change === DELETED || map.set(key, change satisfies V | undefined as V);
    } else {
      map.set(key, value);
    }
  }

  for (const [key, change] of changes) {
    change === DELETED || base.has(key) || map.set(key, change);
  }

  return map;
}

// "Friend" access for `Overlay` to commit into the base version, it is not exposed outside of this module.
let commitChanges: <K, V>(base: VersionedStorage<K, V>, changes: Changes<K, V>) => VersionedStorage<K, V>;

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
 * Note: iterators of the head are live, committing on top of the head while iterating it will affect the iteration.
 *
 * Usage: `storage.mutate()` returns a writable `Overlay`, `overlay.commit()` returns a new read-only version. An overlay
 * cannot be used to create another overlay.
 */
class VersionedStorage<K, V> {
  constructor(map: Map<K, V>) {
    this.#size = map.size;
    this.#state = Object.freeze({ changes: undefined, map, next: undefined });
  }

  readonly #size: number;
  #state: HeadState<K, V> | OlderState<K, V>;

  static {
    commitChanges = (base, changes) => base.#commit(changes);
  }

  /**
   * Commits changes on top of this version and returns the new version.
   *
   * Takes ownership of `changes`: when committing on the head, it is reused as the undo log to save allocations.
   */
  #commit(changes: Changes<K, V>): VersionedStorage<K, V> {
    const { map } = this.#state;

    if (!changes.size) {
      return this;
    } else if (!map) {
      // This version is not the head (branching), copy it.
      const nextMap = new Map(this.toMap());

      applyChanges(nextMap, changes);

      return new VersionedStorage(nextMap);
    }

    // Swap in place: apply each change to the map, and replace it with the previous value to become the undo log.
    // Overwriting an existing key while iterating does not reorder or revisit entries.
    for (const [key, value] of changes) {
      const previous = map.has(key) ? (map.get(key) satisfies V | undefined as V) : DELETED;

      value === DELETED ? map.delete(key) : map.set(key, value);
      changes.set(key, previous);
    }

    const head = new VersionedStorage(map);

    this.#state = Object.freeze({ changes, map: undefined, next: head });

    return head;
  }

  get size(): number {
    return this.#size;
  }

  /**
   * Compresses the undo logs of an older version, so it points to the head directly.
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

    return (this.#state = Object.freeze({ changes, map: undefined, next }));
  }

  get(key: K): V | undefined {
    const state = this.#state;

    if (state.map) {
      return state.map.get(key);
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
      return state.map.has(key);
    }

    const { changes, next } = this.#compress(state);

    return changes.has(key) ? changes.get(key) !== DELETED : next.has(key);
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
   * Returns the content of this version as a `Map`.
   *
   * For the head, returns the underlying `Map` in O(1), it must not be modified. For an older version, returns a new
   * `Map` in O(size).
   */
  toMap(): ReadonlyMap<K, V> {
    const state = this.#state;

    if (state.map) {
      return state.map;
    }

    const { changes, next } = this.#compress(state);

    return mergeChanges(next.toMap(), changes);
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
    this.#changes.set(key, value);
  }

  delete(key: K): boolean {
    this.#assertNotCommitted();

    if (!this.has(key)) {
      return false;
    }

    this.#base.has(key) ? this.#changes.set(key, DELETED) : this.#changes.delete(key);
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
    this.#base = commitChanges(this.#base, this.#changes);
    this.#changes = EMPTY_CHANGES;

    return this.#base;
  }

  /**
   * Returns the content as a new `Map`, O(size).
   */
  toMap(): ReadonlyMap<K, V> {
    return this.#changes.size ? mergeChanges(this.#base.toMap(), this.#changes) : new Map(this.#base.toMap());
  }
}

Object.freeze(Overlay.prototype);
Object.freeze(Overlay);
Object.freeze(VersionedStorage.prototype);
Object.freeze(VersionedStorage);

export { VersionedStorage, type Overlay };
