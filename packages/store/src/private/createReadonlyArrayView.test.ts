import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import createReadonlyArrayView from './createReadonlyArrayView.ts';

scenario(
  'createReadonlyArrayView',
  bdd => {
    bdd
      .given('a read-only array view', () =>
        createReadonlyArrayView(3, index => String.fromCharCode('a'.charCodeAt(0) + index))
      )
      .when('read', view => view)
      .then('should be an array', (_, view) => expect(Array.isArray(view)).toBe(true))
      .and('should have length', (_, view) => expect(view.length).toBe(3))
      .and('should return items by index', (_, view) => {
        expect(view[0]).toBe('a');
        expect(view[2]).toBe('c');
        expect(view[3]).toBeUndefined();
        expect(view.at(-1)).toBe('c');
      })
      .and('should support non-mutating Array methods', (_, view) => {
        expect(view.map(value => value.toUpperCase())).toEqual(['A', 'B', 'C']);
        expect(view.slice(1)).toEqual(['b', 'c']);
        expect(view.indexOf('b')).toBe(1);
        expect(view.includes('c')).toBe(true);
        expect(view.join()).toBe('a,b,c');
      })
      .and('should support spread, iteration, and keys', (_, view) => {
        expect([...view]).toEqual(['a', 'b', 'c']);
        expect(Object.keys(view)).toEqual(['0', '1', '2']);
        expect(0 in view).toBe(true);
        expect(3 in view).toBe(false);
      })
      .and('should equal to an array with same items', (_, view) => expect(view).toEqual(['a', 'b', 'c']))
      .and('should support JSON.stringify()', (_, view) => expect(JSON.stringify(view)).toBe('["a","b","c"]'));

    bdd
      .given('a read-only array view', () => {
        const calls: number[] = [];

        return {
          calls,
          view: createReadonlyArrayView(1_000_000, index => {
            calls.push(index);

            return index;
          })
        };
      })
      .when('created', ({ view }) => view)
      .then('should not resolve any items', ({ calls }) => expect(calls).toEqual([]))
      .and('should resolve only the item accessed', ({ calls }, view) => {
        expect(view[999_999]).toBe(999_999);
        expect(calls).toEqual([999_999]);
      });

    bdd
      .given('a read-only array view', () => createReadonlyArrayView(2, index => index))
      .when('mutated', view => [
        () => ((view as number[])[0] = 1),
        () => (view as number[]).push(2),
        () => (view as number[]).sort(),
        () => delete (view as number[])[0],
        () => Object.defineProperty(view, 'x', { value: 1 }),
        () => ((view as number[]).length = 0)
      ])
      .then('should throw', (_, calls) => {
        for (const call of calls) {
          expect(call).toThrow(TypeError);
        }
      })
      .and('should not change', view => expect(view).toEqual([0, 1]));
  },
  NodeTest
);
