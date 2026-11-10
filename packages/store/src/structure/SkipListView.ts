/** Sentinel of the circular linked list at every level, it is before the first item and after the last item. */
const HEAD: unique symbol = Symbol('head');

type Key<T> = T | typeof HEAD;

/**
 * Links of an item (or the head) at each level. The item is in level 0 to level (height - 1).
 *
 * For the head, `next` is the first item and `previous` is the last item at each level, or the head if the level is
 * empty. Height of the head is the number of levels.
 */
type Entry<T> = {
  readonly next: Key<T>[];
  readonly previous: Key<T>[];
};

type Reader<T> = (key: Key<T>) => Entry<T> | undefined;

function toItem<T>(key: Key<T> | undefined): T | undefined {
  return key === HEAD ? undefined : key;
}

function getEntry<T>(read: Reader<T>, key: Key<T>): Entry<T> {
  const entry = read(key);

  if (!entry) {
    throw new Error('ASSERTION: Linked item is not in the skip list');
  }

  return entry;
}

/**
 * Iterates items at level 0, forward via `next`, or backward via `previous`.
 */
function* iterate<T>(read: Reader<T>, direction: 'next' | 'previous'): Generator<T> {
  // Always read via the reader, if the list is committed on top while iterating, this version is read from undo logs.
  for (
    // eslint-disable-next-line security/detect-object-injection
    let key: Key<T> = read(HEAD)?.[direction][0] ?? HEAD;
    key !== HEAD;
    // eslint-disable-next-line security/detect-object-injection
    key = getEntry(read, key)[direction][0] ?? HEAD
  ) {
    yield key satisfies Key<T> as T;
  }
}

/**
 * Implements read methods based on a reader of entries.
 */
abstract class SkipListView<T> {
  protected abstract read(key: Key<T>): Entry<T> | undefined;

  abstract get size(): number;

  get first(): T | undefined {
    return toItem(this.read(HEAD)?.next[0]);
  }

  get last(): T | undefined {
    return toItem(this.read(HEAD)?.previous[0]);
  }

  getNext(item: T): T | undefined {
    return toItem(item === HEAD ? undefined : this.read(item)?.next[0]);
  }

  getPrevious(item: T): T | undefined {
    return toItem(item === HEAD ? undefined : this.read(item)?.previous[0]);
  }

  has(item: T): boolean {
    return item !== HEAD && !!this.read(item);
  }

  /**
   * Iterates items from the last to the first, O(1) per item.
   */
  reversed(): Iterable<T> {
    return Object.freeze({ [Symbol.iterator]: () => iterate<T>(key => this.read(key), 'previous') });
  }

  [Symbol.iterator](): Iterator<T> {
    return iterate(key => this.read(key), 'next');
  }
}

export default SkipListView;
export { getEntry, HEAD, type Entry, type Key, type Reader };
