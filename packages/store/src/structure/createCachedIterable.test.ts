import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import createCachedIterable from './createCachedIterable.ts';

/** Creates an iterable which counts how many items are pulled from it. */
function createCountingIterable<T>(items: readonly T[]): {
  readonly iterable: Iterable<T>;
  readonly getNumPulled: () => number;
  readonly getNumIterations: () => number;
} {
  let numIterations = 0;
  let numPulled = 0;

  return Object.freeze({
    getNumIterations: () => numIterations,
    getNumPulled: () => numPulled,
    iterable: Object.freeze({
      *[Symbol.iterator](): Iterator<T> {
        numIterations++;

        for (const item of items) {
          numPulled++;

          yield item;
        }
      }
    })
  });
}

scenario(
  'createCachedIterable',
  bdd => {
    bdd
      .given('a cached iterable', () => {
        const counting = createCountingIterable([1, 2, 3]);

        return Object.freeze({ ...counting, cached: createCachedIterable(counting.iterable) });
      })
      .when('nothing is iterated', () => undefined)
      .then('should not iterate the source', ({ getNumIterations }) => expect(getNumIterations()).toBe(0));

    bdd
      .given('a cached iterable', () => {
        const counting = createCountingIterable([1, 2, 3]);

        return Object.freeze({ ...counting, cached: createCachedIterable(counting.iterable) });
      })
      .when('iterated twice', ({ cached }) => Object.freeze([Array.from(cached), Array.from(cached)]))
      .then('should return same result on both iterations', (_, [first, second]) => {
        expect(first).toEqual([1, 2, 3]);
        expect(second).toEqual([1, 2, 3]);
      })
      .and('should iterate the source once', ({ getNumIterations, getNumPulled }) => {
        expect(getNumIterations()).toBe(1);
        expect(getNumPulled()).toBe(3);
      });

    bdd
      .given('a cached iterable', () => {
        const counting = createCountingIterable([1, 2, 3, 4]);

        return Object.freeze({ ...counting, cached: createCachedIterable(counting.iterable) });
      })
      .when('the first iteration stops early', ({ cached }) => {
        for (const item of cached) {
          if (item === 2) {
            break;
          }
        }
      })
      .then('should pull only the items iterated', ({ getNumPulled }) => expect(getNumPulled()).toBe(2))
      .when('iterated again', ({ cached }) => Array.from(cached))
      .then('should return all items', (_, result) => expect(result).toEqual([1, 2, 3, 4]))
      .and('should continue the source iteration without restarting', ({ getNumIterations, getNumPulled }) => {
        expect(getNumIterations()).toBe(1);
        expect(getNumPulled()).toBe(4);
      });

    bdd
      .given('a cached iterable with two interleaving iterators', () => {
        const counting = createCountingIterable(['a', 'b', 'c']);
        const cached = createCachedIterable(counting.iterable);

        return Object.freeze({
          ...counting,
          first: cached[Symbol.iterator](),
          second: cached[Symbol.iterator]()
        });
      })
      .when('the iterators are advanced in turn', ({ first, second }) =>
        Object.freeze([first.next(), second.next(), second.next(), first.next(), first.next(), first.next()])
      )
      .then('should return the items in order for each iterator', (_, result) =>
        expect(result.map(({ done, value }) => (done ? 'done' : value))).toEqual(['a', 'a', 'b', 'b', 'c', 'done'])
      )
      .and('should iterate the source once', ({ getNumIterations, getNumPulled }) => {
        expect(getNumIterations()).toBe(1);
        expect(getNumPulled()).toBe(3);
      });

    bdd
      .given('a cached iterable of a source which throws after the first item', () => {
        let numThrown = 0;

        const cached = createCachedIterable({
          *[Symbol.iterator](): Iterator<number> {
            yield 1;

            numThrown++;

            throw new Error('Artificial error');
          }
        });

        return Object.freeze({ cached, getNumThrown: () => numThrown });
      })
      .when('iterated twice', ({ cached }) =>
        Object.freeze(
          [0, 1].map(() => {
            try {
              return Array.from(cached);
            } catch (error) {
              return error;
            }
          })
        )
      )
      .then('should throw on both iterations', (_, result) =>
        expect(result).toEqual([new Error('Artificial error'), new Error('Artificial error')])
      )
      .and('should iterate the source once', ({ getNumThrown }) => expect(getNumThrown()).toBe(1));

    bdd
      .given('a cached iterable of an empty source', () => createCachedIterable([]))
      .when('iterated twice', cached => Object.freeze([Array.from(cached), Array.from(cached)]))
      .then('should return empty on both iterations', (_, [first, second]) => {
        expect(first).toEqual([]);
        expect(second).toEqual([]);
      });

    bdd
      .given('a cached iterable', () => createCachedIterable([1]))
      .when('read', cached => cached)
      .then('should be frozen', (_, cached) => expect(Object.isFrozen(cached)).toBe(true));
  },
  NodeTest
);
