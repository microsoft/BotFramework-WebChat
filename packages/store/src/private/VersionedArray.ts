type Splice<T> = {
  readonly deleteCount: number;
  readonly items: readonly T[];
  readonly start: number;
};

/** The version owns the array, it is the latest version of the array, or an old version which is rebuilt. */
type OwnerState<T> = {
  readonly array: T[];
  readonly next: undefined;
  readonly undo: undefined;
};

/** The version does not own the array, it is a newer version with an undo log applied. */
type DeltaState<T> = {
  readonly array: undefined;
  // eslint-disable-next-line no-use-before-define
  readonly next: VersionedArray<T>;
  readonly undo: Splice<T>;
};

/**
 * A persistent (immutable) array. Every modification returns a new version, all versions are kept intact.
 *
 * The version which owns the array is modified in place and becomes an undo log of the new version:
 *
 * - Modifying the latest version is O(number of items after the splice point), appending is O(1)
 * - Reading the latest version is O(1)
 * - Reading an old version for the first time rebuilds it in O(n + number of later modifications), then O(1)
 * - Modifying an old version rebuilds it first
 */
class VersionedArray<T> {
  /**
   * @param array The array will be owned by the instance and must not be modified elsewhere.
   */
  constructor(array: T[] = []) {
    this.#length = array.length;
    this.#state = Object.freeze({ array, next: undefined, undo: undefined });
  }

  readonly #length: number;
  #state: DeltaState<T> | OwnerState<T>;

  #own(): T[] {
    const state = this.#state;

    if (state.array) {
      return state.array;
    }

    // Undo logs from this version to the version owning the array, nearest first.
    const undos: Splice<T>[] = [];
    let current: DeltaState<T> | OwnerState<T> = state;

    while (!current.array) {
      undos.push(current.undo);

      current = current.next.#state;
    }

    const array = current.array.slice();

    for (const { deleteCount, items, start } of undos.reverse()) {
      array.splice(start, deleteCount, ...items);
    }

    this.#state = Object.freeze({ array, next: undefined, undo: undefined });

    return array;
  }

  get length(): number {
    return this.#length;
  }

  at(index: number): T | undefined {
    return index >= 0 && index < this.#length ? this.#own()[+index] : undefined;
  }

  /**
   * Returns a new version with items removed and/or inserted, similar to `Array.prototype.splice()`.
   */
  splice(start: number, deleteCount: number, ...items: readonly T[]): VersionedArray<T> {
    const array = this.#own();
    const deleted = array.splice(start, deleteCount, ...items);
    const next = new VersionedArray(array);

    this.#state = Object.freeze({
      array: undefined,
      next,
      undo: Object.freeze({ deleteCount: items.length, items: Object.freeze(deleted), start })
    });

    return next;
  }
}

Object.freeze(VersionedArray.prototype);
Object.freeze(VersionedArray);

export default VersionedArray;
