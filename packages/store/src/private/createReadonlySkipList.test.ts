import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import createReadonlySkipList, {
  type ReadWriteSkipList,
  type VersionedReadonlySkipList
} from './createReadonlySkipList.ts';

type SkipList<T> = ReadWriteSkipList<T> | VersionedReadonlySkipList<T>;

function insert(list: ReadWriteSkipList<number>, item: number): ReadWriteSkipList<number> {
  return list.insert(item, other => other > item);
}

function createList(items: readonly number[]): VersionedReadonlySkipList<number> {
  return items.reduce(insert, createReadonlySkipList<number>().mutate()).commit();
}

function toArrayBackward<T>(list: SkipList<T>): T[] {
  const items: T[] = [];

  for (let item = list.last; item !== undefined; item = list.getPrevious(item)) {
    items.unshift(item);
  }

  return items;
}

function expectItems<T>(list: SkipList<T>, expected: readonly T[]): void {
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
  'createReadonlySkipList',
  bdd => {
    bdd
      .given('an empty list', () => createReadonlySkipList<number>())
      .when('read', list => list)
      .then('should have no items', (_, list) => expectItems(list, []))
      .and('should not have any item', (_, list) => expect(list.has(1)).toBe(false))
      .and('should be frozen', (_, list) => expect(Object.isFrozen(list)).toBe(true));

    bdd
      .given('an empty list', () => createReadonlySkipList<number>())
      .when.oneOf<VersionedReadonlySkipList<number>>([
        ['items are appended', list => [1, 2, 3, 4].reduce(insert, list.mutate()).commit()],
        ['items are prepended', list => [4, 3, 2, 1].reduce(insert, list.mutate()).commit()],
        ['items are inserted out of order', list => [3, 1, 4, 2].reduce(insert, list.mutate()).commit()]
      ])
      .then('should have the items sorted', (_, next) => expectItems(next, [1, 2, 3, 4]))
      .and('should have the items', (_, next) => {
        expect(next.has(1)).toBe(true);
        expect(next.has(5)).toBe(false);
      })
      .and('should support getNext() and getPrevious()', (_, next) => {
        expect(next.getNext(2)).toBe(3);
        expect(next.getNext(4)).toBeUndefined();
        expect(next.getNext(5)).toBeUndefined();
        expect(next.getPrevious(2)).toBe(1);
        expect(next.getPrevious(1)).toBeUndefined();
      })
      .and('should keep the original list intact', list => expectItems(list, []));

    bdd
      .given('a list and an overlay', () => {
        const list = createList([1, 2, 4]);
        const overlay = list.mutate();

        overlay.delete(2);
        insert(overlay, 3);

        return { list, overlay };
      })
      .when('the overlay is read', ({ overlay }) => overlay)
      .then('should have changes', (_, overlay) => expectItems(overlay, [1, 3, 4]))
      .and('should not modify the original list', ({ list }) => expectItems(list, [1, 2, 4]));

    bdd
      .given('a list', () => createList([1, 2, 3, 4]))
      .when.oneOf<readonly [VersionedReadonlySkipList<number>, readonly number[], boolean]>([
        [
          'the first item is deleted',
          list => {
            const o = list.mutate();
            const r = o.delete(1);
            return [o.commit(), [2, 3, 4], r];
          }
        ],
        [
          'the middle item is deleted',
          list => {
            const o = list.mutate();
            const r = o.delete(2);
            return [o.commit(), [1, 3, 4], r];
          }
        ],
        [
          'the last item is deleted',
          list => {
            const o = list.mutate();
            const r = o.delete(4);
            return [o.commit(), [1, 2, 3], r];
          }
        ],
        [
          'a non-existing item is deleted',
          list => {
            const o = list.mutate();
            const r = o.delete(5);
            return [o.commit(), [1, 2, 3, 4], r];
          }
        ],
        [
          'all items are deleted',
          list => {
            const o = list.mutate();

            [2, 4, 1, 3].forEach(item => o.delete(item));

            return [o.commit(), [], true];
          }
        ]
      ])
      .then('should have the remaining items sorted', (_, [next, expected]) => expectItems(next, expected))
      .and('should return whether the item was deleted', (_, [, , result]) => expect(typeof result).toBe('boolean'))
      .and('should keep the previous version intact', list => expectItems(list, [1, 2, 3, 4]));

    bdd
      .given('an empty list', () => createReadonlySkipList<number>())
      .when('1,000 random items are inserted and deleted, one commit per change', list => {
        const versions = [list];

        createNumbers(1_000).forEach((item, index) => {
          const overlay = (versions.at(-1) as VersionedReadonlySkipList<number>).mutate();

          // Delete the first item on every 3rd step.
          index % 3 === 2 ? overlay.delete(overlay.first as number) : insert(overlay, item);

          versions.push(overlay.commit());
        });

        return versions;
      })
      .then('every version should keep its own items sorted', (_, versions) => {
        let expected: number[] = [];

        // Read from the oldest version, every old version will be read from undo logs.
        versions.forEach((version, index) => {
          if (index) {
            const item = createNumbers(index).at(-1) as number;

            expected = (index - 1) % 3 === 2 ? expected.slice(1) : [...expected, item].sort((x, y) => x - y);
          }

          expectItems(version, expected);
        });
      });

    bdd
      .given('an empty list', () => createReadonlySkipList<number>())
      .when('1,000 random items are inserted and every 3rd is deleted in a single commit', list => {
        const overlay = list.mutate();
        const numbers = createNumbers(1_000);

        numbers.forEach(item => insert(overlay, item));
        numbers.forEach((item, index) => index % 3 || overlay.delete(item));

        return overlay.commit();
      })
      .then('should have the items sorted', (_, next) =>
        expectItems(
          next,
          createNumbers(1_000)
            .filter((_, index) => index % 3)
            .sort((x, y) => x - y)
        )
      );

    bdd
      .given('a list with a newer version', () => {
        const list = createList([1, 2]);

        return { list, next: insert(list.mutate(), 3).commit() };
      })
      .when('the old version is modified', ({ list }) => {
        const overlay = list.mutate();

        overlay.delete(1);

        return overlay.commit();
      })
      .then('should branch from the old version', (_, branch) => expectItems(branch, [2]))
      .and('should keep the old version intact', ({ list }) => expectItems(list, [1, 2]))
      .and('should keep the newer version intact', ({ next }) => expectItems(next, [1, 2, 3]));

    bdd
      .given('a list and a started iteration', () => {
        const list = createList([1, 2, 3]);
        const iterator = list[Symbol.iterator]();

        return { first: iterator.next().value, iterator, list };
      })
      .when('the list is modified while iterating', ({ list }) => {
        const overlay = list.mutate();

        overlay.delete(2);
        insert(overlay, 2.5);

        return overlay.commit();
      })
      .then('should continue the iteration without the changes', ({ first, iterator }) => {
        expect(first).toBe(1);
        expect(Array.from({ [Symbol.iterator]: () => iterator })).toEqual([2, 3]);
      })
      .and('should have the changes in the new version', (_, next) => expectItems(next, [1, 2.5, 3]));

    bdd
      .given('an overlay', () => createList([1, 2]).mutate())
      .when.oneOf<() => unknown>([
        ['an existing item is inserted', overlay => () => insert(overlay, 1)],
        [
          'it is modified after commit',
          overlay => {
            overlay.commit();

            return () => insert(overlay, 3);
          }
        ],
        [
          'it is committed twice',
          overlay => {
            overlay.commit();

            return () => overlay.commit();
          }
        ]
      ])
      .then('should throw', (_, fn) => expect(fn).toThrow());
  },
  NodeTest
);
