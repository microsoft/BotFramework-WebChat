/** A level of the skip list, a doubly linked list. Level 0 has all items, higher levels have fewer items. */
type Level<T> = {
  first: T | undefined;
  last: T | undefined;
  readonly next: Map<T, T>;
  readonly previous: Map<T, T>;
};

type Links<T> = {
  /** Number of levels of each item, the item is in level 0 to level (height - 1). */
  readonly heights: Map<T, number>;
  readonly levels: Level<T>[];
};

type Undo<T> =
  // `befores` is the item which the item is inserted before at each level, `undefined` means at the end.
  | { readonly befores: readonly (T | undefined)[]; readonly item: T; readonly type: 'insert' }
  | { readonly item: T; readonly type: 'delete' };

/** The version owns the links, it is the latest version of the list, or an old version which is rebuilt. */
type OwnerState<T> = {
  readonly links: Links<T>;
  readonly next: undefined;
  readonly undo: undefined;
};

/** The version does not own the links, it is a newer version with an undo log applied. */
type DeltaState<T> = {
  readonly links: undefined;
  // eslint-disable-next-line no-use-before-define
  readonly next: VersionedSkipList<T>;
  readonly undo: Undo<T>;
};

const MAX_HEIGHT = 32;

function createLevel<T>(): Level<T> {
  return { first: undefined, last: undefined, next: new Map(), previous: new Map() };
}

/** Geometric distribution with p = 1/2, i.e. half of the items are in level 1, quarter of the items are in level 2. */
function getRandomHeight(): number {
  let height = 1;

  // eslint-disable-next-line no-magic-numbers
  while (height < MAX_HEIGHT && Math.random() < 0.5) {
    height++;
  }

  return height;
}

function insertIntoLevel<T>(level: Level<T>, item: T, before: T | undefined): void {
  const previous = before === undefined ? level.last : level.previous.get(before);

  if (previous === undefined) {
    level.first = item;
  } else {
    level.next.set(previous, item);
    level.previous.set(item, previous);
  }

  if (before === undefined) {
    level.last = item;
  } else {
    level.next.set(item, before);
    level.previous.set(before, item);
  }
}

/**
 * @returns The item after the deleted item.
 */
function deleteFromLevel<T>(level: Level<T>, item: T): T | undefined {
  const next = level.next.get(item);
  const previous = level.previous.get(item);

  level.next.delete(item);
  level.previous.delete(item);

  if (previous === undefined) {
    level.first = next;
  } else if (next === undefined) {
    level.next.delete(previous);
  } else {
    level.next.set(previous, next);
  }

  if (next === undefined) {
    level.last = previous;
  } else if (previous === undefined) {
    level.previous.delete(next);
  } else {
    level.previous.set(next, previous);
  }

  return next;
}

function insertItem<T>(links: Links<T>, item: T, befores: readonly (T | undefined)[]): void {
  links.heights.set(item, befores.length);

  befores.forEach((before, index) => insertIntoLevel((links.levels[+index] ??= createLevel()), item, before));
}

/**
 * @returns The items after the deleted item at each level.
 */
function deleteItem<T>(links: Links<T>, item: T): (T | undefined)[] {
  const befores: (T | undefined)[] = [];
  const height = links.heights.get(item) ?? 0;

  links.heights.delete(item);

  for (let index = 0; index < height; index++) {
    befores.push(deleteFromLevel(links.levels[+index] as Level<T>, item));
  }

  return befores;
}

/**
 * Finds the item which the new item should be inserted before at each level, `undefined` means at the end.
 *
 * Searches from the end: O(1) if the new item is at the end, otherwise, expected O(log n).
 */
function findBefores<T>(links: Links<T>, height: number, isAfter: (item: T) => boolean): (T | undefined)[] {
  const { levels } = links;
  const lastItem = levels[0]?.last;

  // Fast path for appending.
  if (lastItem === undefined || !isAfter(lastItem)) {
    return new Array(height).fill(undefined);
  }

  const befores: (T | undefined)[] = new Array(height);
  let before: T | undefined;

  for (let index = levels.length - 1; index >= 0; index--) {
    const level = levels[+index] as Level<T>;

    for (
      let item = before === undefined ? level.last : level.previous.get(before);
      item !== undefined && isAfter(item);
      item = level.previous.get(item)
    ) {
      before = item;
    }

    index < height && (befores[+index] = before);
  }

  // Levels which are not created yet.
  return befores.fill(undefined, levels.length);
}

/**
 * A persistent (immutable) sorted list of unique items, using a skip list: a doubly linked list with express lanes.
 * Every modification returns a new version, all versions are kept intact.
 *
 * The version which owns the links is modified in place and becomes an undo log of the new version:
 *
 * - Inserting into the latest version is O(1) when appending, otherwise, expected O(log n), no items are shifted
 * - Deleting from the latest version is expected O(1)
 * - Reading the latest version is O(1) per item
 * - Reading an old version for the first time rebuilds it in O(n + number of later modifications), then O(1) per item
 * - Modifying an old version rebuilds it first
 */
class VersionedSkipList<T> {
  /**
   * Creates an empty list. Arguments are for internal use only.
   */
  constructor(links?: Links<T> | undefined, size: number = 0) {
    this.#size = size;
    this.#state = Object.freeze({
      links: links ?? { heights: new Map(), levels: [] },
      next: undefined,
      undo: undefined
    });
  }

  readonly #size: number;
  #state: DeltaState<T> | OwnerState<T>;

  #own(): Links<T> {
    const state = this.#state;

    if (state.links) {
      return state.links;
    }

    // Undo logs from this version to the version owning the links, nearest first.
    const undos: Undo<T>[] = [];
    let current: DeltaState<T> | OwnerState<T> = state;

    while (!current.links) {
      undos.push(current.undo);

      current = current.next.#state;
    }

    const links: Links<T> = {
      heights: new Map(current.links.heights),
      levels: current.links.levels.map(({ first, last, next, previous }) => ({
        first,
        last,
        next: new Map(next),
        previous: new Map(previous)
      }))
    };

    for (const undo of undos.reverse()) {
      undo.type === 'insert' ? insertItem(links, undo.item, undo.befores) : deleteItem(links, undo.item);
    }

    this.#state = Object.freeze({ links, next: undefined, undo: undefined });

    return links;
  }

  #update(undo: Undo<T>, size: number): VersionedSkipList<T> {
    // The links are handed over to the new version, this version becomes an undo log.
    const next = new VersionedSkipList<T>(this.#own(), size);

    this.#state = Object.freeze({ links: undefined, next, undo: Object.freeze(undo) });

    return next;
  }

  get first(): T | undefined {
    return this.#size ? this.#own().levels[0]?.first : undefined;
  }

  get last(): T | undefined {
    return this.#size ? this.#own().levels[0]?.last : undefined;
  }

  get size(): number {
    return this.#size;
  }

  has(item: T): boolean {
    return this.#own().heights.has(item);
  }

  /** Gets the item after the specified item, or `undefined` if it is the last item or not in the list. */
  getNext(item: T): T | undefined {
    return this.#own().levels[0]?.next.get(item);
  }

  /** Gets the item before the specified item, or `undefined` if it is the first item or not in the list. */
  getPrevious(item: T): T | undefined {
    return this.#own().levels[0]?.previous.get(item);
  }

  /**
   * Returns a new version with the item deleted.
   */
  delete(item: T): VersionedSkipList<T> {
    if (!this.has(item)) {
      throw new Error('Item is not in the list');
    }

    const befores = Object.freeze(deleteItem(this.#own(), item));

    return this.#update({ befores, item, type: 'insert' }, this.#size - 1);
  }

  /**
   * Returns a new version with the item inserted before the last item which `isAfter()` returns `true`, searching from
   * the end. Items must be sorted, i.e. `isAfter()` returns `false` for all items before the new item.
   *
   * @param isAfter Returns `true` if the existing item should be sorted after the new item.
   */
  insert(item: T, isAfter: (item: T) => boolean): VersionedSkipList<T> {
    if (this.has(item)) {
      throw new Error('Item is already in the list');
    }

    const links = this.#own();

    insertItem(links, item, findBefores(links, getRandomHeight(), isAfter));

    return this.#update({ item, type: 'delete' }, this.#size + 1);
  }

  /**
   * Iterates the items lazily. Modifying the list while iterating will not affect the iteration.
   */
  *[Symbol.iterator](): Iterator<T> {
    // Always read via #own(), if the list is modified while iterating, this version will be rebuilt.
    for (let item = this.first; item !== undefined; item = this.getNext(item)) {
      yield item;
    }
  }
}

Object.freeze(VersionedSkipList.prototype);
Object.freeze(VersionedSkipList);

export default VersionedSkipList;
