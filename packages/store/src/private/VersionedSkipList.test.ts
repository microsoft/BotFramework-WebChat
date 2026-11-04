import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import VersionedSkipList from './VersionedSkipList.ts';

function insert(list: VersionedSkipList<number>, item: number): VersionedSkipList<number> {
  return list.insert(item, other => other > item);
}

function createList(items: readonly number[]): VersionedSkipList<number> {
  return items.reduce(insert, new VersionedSkipList<number>());
}

function toArrayBackward<T>(list: VersionedSkipList<T>): T[] {
  const items: T[] = [];

  for (let item = list.last; item !== undefined; item = list.getPrevious(item)) {
    items.unshift(item);
  }

  return items;
}

function expectItems<T>(list: VersionedSkipList<T>, expected: readonly T[]): void {
  expect(Array.from(list)).toEqual(expected);
  expect(toArrayBackward(list)).toEqual(expected);
  expect(list.size).toBe(expected.length);
  expect(list.first).toBe(expected.at(0));
  expect(list.last).toBe(expected.at(-1));
}

/** Pseudo-random numbers, so tests are deterministic. */
function createNumbers(count: number): number[] {
  let seed = 1;

  return Array.from({ length: count }, () => (seed = (seed * 16_807) % 2_147_483_647));
}

scenario(
  'VersionedSkipList',
  bdd => {
    bdd
      .given('an empty list', () => new VersionedSkipList<number>())
      .when('read', list => list)
      .then('should have no items', (_, list) => expectItems(list, []))
      .and('should not have any item', (_, list) => expect(list.has(1)).toBe(false));

    bdd
      .given('an empty list', () => new VersionedSkipList<number>())
      .when.oneOf<VersionedSkipList<number>>([
        ['items are appended', list => [1, 2, 3, 4].reduce(insert, list)],
        ['items are prepended', list => [4, 3, 2, 1].reduce(insert, list)],
        ['items are inserted out of order', list => [3, 1, 4, 2].reduce(insert, list)]
      ])
      .then('should have the items sorted', (_, next) => expectItems(next, [1, 2, 3, 4]))
      .and('should have the items', (_, next) => {
        expect(next.has(1)).toBe(true);
        expect(next.has(5)).toBe(false);
      })
      .and('should support getNext() and getPrevious()', (_, next) => {
        expect(next.getNext(2)).toBe(3);
        expect(next.getNext(4)).toBeUndefined();
        expect(next.getPrevious(2)).toBe(1);
        expect(next.getPrevious(1)).toBeUndefined();
      })
      .and('should keep the previous version intact', list => expectItems(list, []));

    bdd
      .given('a list', () => createList([1, 2, 3, 4]))
      .when.oneOf<readonly [VersionedSkipList<number>, readonly number[]]>([
        ['the first item is deleted', list => [list.delete(1), [2, 3, 4]]],
        ['the middle item is deleted', list => [list.delete(2), [1, 3, 4]]],
        ['the last item is deleted', list => [list.delete(4), [1, 2, 3]]],
        ['all items are deleted', list => [list.delete(2).delete(4).delete(1).delete(3), []]]
      ])
      .then('should have the remaining items sorted', (_, [next, expected]) => expectItems(next, expected))
      .and('should keep the previous version intact', list => expectItems(list, [1, 2, 3, 4]));

    bdd
      .given('an empty list', () => new VersionedSkipList<number>())
      .when('1,000 random items are inserted and deleted one by one', list => {
        const versions = [list];

        createNumbers(1_000).forEach((item, index) => {
          const current = versions.at(-1) as VersionedSkipList<number>;

          // Delete the first item on every 3rd step.
          versions.push(index % 3 === 2 ? current.delete(current.first as number) : insert(current, item));
        });

        return versions;
      })
      .then('every version should keep its own items sorted', (_, versions) => {
        let expected: number[] = [];

        // Read from the oldest version, every old version will be rebuilt.
        versions.forEach((version, index) => {
          if (index) {
            const item = createNumbers(index).at(-1) as number;

            expected = (index - 1) % 3 === 2 ? expected.slice(1) : [...expected, item].sort((x, y) => x - y);
          }

          expectItems(version, expected);
        });
      });

    bdd
      .given('a list with a newer version', () => {
        const list = createList([1, 2]);

        return { list, next: insert(list, 3) };
      })
      .when('the old version is modified', ({ list }) => list.delete(1))
      .then('should branch from the old version', (_, branch) => expectItems(branch, [2]))
      .and('should keep the old version intact', ({ list }) => expectItems(list, [1, 2]))
      .and('should keep the newer version intact', ({ next }) => expectItems(next, [1, 2, 3]));

    bdd
      .given('a list and a started iteration', () => {
        const list = createList([1, 2, 3]);
        const iterator = list[Symbol.iterator]();

        return { first: iterator.next().value, iterator, list };
      })
      .when('the list is modified while iterating', ({ list }) => insert(list.delete(2), 2.5))
      .then('should continue the iteration without the changes', ({ first, iterator }) => {
        expect(first).toBe(1);
        expect(Array.from({ [Symbol.iterator]: () => iterator })).toEqual([2, 3]);
      })
      .and('should have the changes in the new version', (_, next) => expectItems(next, [1, 2.5, 3]));

    bdd
      .given('a list', () => createList([1, 2]))
      .when.oneOf<() => unknown>([
        ['an existing item is inserted', list => () => insert(list, 1)],
        ['a non-existing item is deleted', list => () => list.delete(3)]
      ])
      .then('should throw', (_, fn) => expect(fn).toThrow())
      .and('should keep the list intact', list => expectItems(list, [1, 2]));
  },
  NodeTest
);
