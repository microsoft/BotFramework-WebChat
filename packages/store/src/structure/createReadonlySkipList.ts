import SkipListView, { getEntry, HEAD, type Entry, type Key, type Reader } from './SkipListView.ts';
import { Overlay, VersionedStorage } from './VersionedStorage.ts';

const MAX_HEIGHT = 32;

/**
 * A read-only sorted list of unique items.
 */
interface VersionedReadonlySkipList<T> extends Iterable<T> {
  readonly first: T | undefined;
  readonly last: T | undefined;
  readonly size: number;

  /** Gets the item after the specified item, or `undefined` if it is the last item or not in the list. */
  getNext(item: T): T | undefined;

  /** Gets the item before the specified item, or `undefined` if it is the first item or not in the list. */
  getPrevious(item: T): T | undefined;

  has(item: T): boolean;

  /**
   * Creates a writable overlay on top of this list. Writes go to the overlay, reads go to the overlay first, then this
   * list. This list is not modified, even after the overlay is committed.
   *
   * This is O(1) and does not copy the list.
   */
  mutate(): ReadWriteSkipList<T>;
}

/**
 * A writable overlay on top of a read-only sorted list.
 */
interface ReadWriteSkipList<T> extends Omit<VersionedReadonlySkipList<T>, 'mutate'> {
  /**
   * Commits changes in the overlay and returns a new read-only list. The overlay cannot be modified after.
   *
   * This is O(number of changes) if the underlying list is the latest version (i.e. no other overlay on top of the
   * same list has been committed), otherwise, O(size) as the list is copied.
   */
  commit(): VersionedReadonlySkipList<T>;

  /**
   * Deletes the item, returns `true` if the item was in the list. This is expected O(1).
   */
  delete(item: T): boolean;

  /**
   * Inserts the item after the last item which `isAfter()` returns `false`, searching from the end. Items must be
   * sorted, i.e. `isAfter()` returns `true` for all items after the new item. Throws if the item is already in the list.
   *
   * This is O(1) when appending to the end, otherwise, expected O(log n). No items are shifted.
   *
   * @param isAfter Returns `true` if the existing item should be sorted after the new item.
   */
  insert(item: T, isAfter: (item: T) => boolean): this;
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

class ReadWriteSkipListImpl<T> extends SkipListView<T> implements ReadWriteSkipList<T> {
  constructor(overlay: Overlay<Key<T>, Entry<T>>) {
    super();

    this.#overlay = overlay;

    Object.freeze(this);
  }

  readonly #overlay: Overlay<Key<T>, Entry<T>>;

  /** Entries created by this overlay, they are not in any committed version and can be modified in place. */
  readonly #ownedEntries = new Set<Entry<T>>();

  protected read(key: Key<T>): Entry<T> | undefined {
    return this.#overlay.get(key);
  }

  /** Gets a writable entry, entries of committed versions are copied into the overlay before modification. */
  #write(key: Key<T>): Entry<T> {
    const entry = this.read(key) ?? { next: [], previous: [] };

    if (this.#ownedEntries.has(entry)) {
      return entry;
    }

    const nextEntry: Entry<T> = { next: entry.next.slice(), previous: entry.previous.slice() };

    this.#ownedEntries.add(nextEntry);
    this.#overlay.set(key, nextEntry);

    return nextEntry;
  }

  get size(): number {
    // Excludes the head.
    return Math.max(0, this.#overlay.size - 1);
  }

  commit(): VersionedReadonlySkipList<T> {
    for (const { next, previous } of this.#ownedEntries) {
      Object.freeze(next);
      Object.freeze(previous);
    }

    this.#ownedEntries.clear();

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new ReadonlySkipListImpl(this.#overlay.commit());
  }

  delete(item: T): boolean {
    const entry = item === HEAD ? undefined : this.read(item);

    if (!entry) {
      return false;
    }

    entry.next.forEach((next, level) => {
      const previous = entry.previous[+level] satisfies Key<T> | undefined as Key<T>;

      this.#write(previous).next[+level] = next;
      this.#write(next).previous[+level] = previous;
    });

    this.#overlay.delete(item);

    return true;
  }

  insert(item: T, isAfter: (item: T) => boolean): this {
    if (this.has(item)) {
      throw new Error('Item is already in the list');
    }

    const height = getRandomHeight();
    const read: Reader<T> = key => this.read(key);
    const head = this.read(HEAD);
    const numLevels = head?.next.length ?? 0;

    // Finds the item which the new item should be inserted before at each level, the head means at the end.
    const befores: Key<T>[] = new Array(height).fill(HEAD);
    const lastKey = head?.previous[0] ?? HEAD;

    // Appending to the end (fast path) does not need to search.
    if (lastKey !== HEAD && isAfter(lastKey)) {
      let before: Key<T> = HEAD;

      for (let level = numLevels - 1; level >= 0; level--) {
        for (
          let key: Key<T> = getEntry(read, before).previous[+level] ?? HEAD;
          key !== HEAD && isAfter(key);
          key = getEntry(read, key).previous[+level] ?? HEAD
        ) {
          before = key;
        }

        level < height && (befores[+level] = before);
      }
    }

    const entry = this.#write(item);
    const headEntry = this.#write(HEAD);

    // Adds levels to the head which are not created yet, empty level points to the head itself.
    for (let level = headEntry.next.length; level < height; level++) {
      headEntry.next[+level] = HEAD;
      headEntry.previous[+level] = HEAD;
    }

    befores.forEach((before, level) => {
      const previous = getEntry(read, before).previous[+level] satisfies Key<T> | undefined as Key<T>;

      entry.next[+level] = before;
      entry.previous[+level] = previous;
      this.#write(previous).next[+level] = item;
      this.#write(before).previous[+level] = item;
    });

    return this;
  }
}

/**
 * A persistent (immutable) sorted list of unique items, using a skip list: doubly linked lists with express lanes.
 *
 * Links are kept in a `VersionedStorage`, `mutate()` creates an overlay without copying, and `commit()` writes the
 * changes into the storage in O(number of changes). Old versions are kept intact.
 *
 * - Reading the latest version is O(1) per item
 * - Reading an old version walks the undo logs, see `VersionedStorage` for details
 */
class ReadonlySkipListImpl<T> extends SkipListView<T> implements VersionedReadonlySkipList<T> {
  constructor(storage: VersionedStorage<Key<T>, Entry<T>>) {
    super();

    this.#storage = storage;

    Object.freeze(this);
  }

  readonly #storage: VersionedStorage<Key<T>, Entry<T>>;

  protected read(key: Key<T>): Entry<T> | undefined {
    return this.#storage.get(key);
  }

  get size(): number {
    // Excludes the head.
    return Math.max(0, this.#storage.size - 1);
  }

  mutate(): ReadWriteSkipList<T> {
    return new ReadWriteSkipListImpl(new Overlay(this.#storage));
  }
}

Object.freeze(ReadWriteSkipListImpl.prototype);
Object.freeze(ReadWriteSkipListImpl);
Object.freeze(ReadonlySkipListImpl.prototype);
Object.freeze(ReadonlySkipListImpl);

/**
 * Creates an empty immutable sorted list. Use `mutate()` to create a writable overlay, then `commit()` to get a new
 * immutable list.
 */
function createReadonlySkipList<T>(): VersionedReadonlySkipList<T> {
  return new ReadonlySkipListImpl<T>(new VersionedStorage(new Map()));
}

export default createReadonlySkipList;
export { type ReadWriteSkipList, type VersionedReadonlySkipList };
