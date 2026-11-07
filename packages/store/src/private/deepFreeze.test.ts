import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import createReadonlySet from '../structure/createReadonlySet.ts';
import deepFreeze from './deepFreeze.ts';

scenario(
  'deepFreeze',
  bdd => {
    bdd
      .given('a deeply frozen value which is the same as the validated value', () =>
        Object.freeze({ items: Object.freeze([1, Object.freeze({ two: 2 })]), name: 'Hello' })
      )
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should return the value as-is', (value, result) => expect(result).toBe(value));

    bdd
      .given('a deeply frozen value and a validated copy', () => {
        const value = Object.freeze({ items: Object.freeze([1, 2]) });

        return { copy: { items: [1, 2] }, value };
      })
      .when('deepFreeze() is called', ({ copy, value }) => deepFreeze(value, copy))
      .then('should return the original value as-is', ({ value }, result) => expect(result).toBe(value));

    bdd
      .given('a shallowly frozen value', () => Object.freeze({ items: [1, 2] }))
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should return a copy', (value, result) => {
        expect(result).not.toBe(value);
        expect(result).toEqual(value);
      })
      .and('should deeply freeze the copy', (_, result) => {
        expect(Object.isFrozen(result)).toBe(true);
        expect(Object.isFrozen(result.items)).toBe(true);
      });

    bdd
      .given('a deeply frozen value which is different from the validated value', () =>
        Object.freeze({ items: Object.freeze([1, 2]), name: 'Hello' })
      )
      .when('deepFreeze() is called with a validated value with fewer properties', value =>
        deepFreeze(value, { items: [1, 2] })
      )
      .then('should return a copy of the validated value', (_, result) => expect(result).toEqual({ items: [1, 2] }))
      .and('should reuse the unchanged deeply frozen part', (value, result) => expect(result.items).toBe(value.items));

    bdd
      .given('a read-only Set', () => createReadonlySet(['one', 'two']))
      .when('deepFreeze() is called with a validated copy', value => deepFreeze(value, new Set(value)))
      .then('should return the read-only Set as-is', (value, result) => expect(result).toBe(value));

    bdd
      .given('a frozen mutable Set', () => Object.freeze(new Set(['one'])))
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should return a read-only Set copy', (value, result) => {
        expect(result).not.toBe(value);
        expect(() => (result as Set<string>).add('two')).toThrow(TypeError);
      });

    bdd.given
      .oneOf([
        ['"__proto__"', () => JSON.parse('{"__proto__":{"polluted":true},"name":"Hello"}')],
        ['"constructor"', () => JSON.parse('{"constructor":{"polluted":true},"name":"Hello"}')],
        ['"prototype"', () => JSON.parse('{"prototype":{"polluted":true},"name":"Hello"}')]
      ])
      .when('deepFreeze() is called', value => deepFreeze(undefined, value))
      .then('should skip the dangerous property', (_, result) => {
        expect(Object.keys(result)).toEqual(['name']);
        expect(Object.getOwnPropertyNames(result)).toEqual(['name']);
      })
      .and('should be a plain object', (_, result) => {
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect(result).not.toHaveProperty('polluted');
      })
      .and('should be frozen', (_, result) => expect(Object.isFrozen(result)).toBe(true));

    bdd
      .given('a deeply frozen object with own "__proto__" property', () =>
        Object.freeze(
          Object.defineProperty({ name: 'Hello' }, '__proto__', { enumerable: true, value: Object.freeze({}) })
        )
      )
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should not reuse the original value', (value, result) => expect(result).not.toBe(value))
      .and('should skip the dangerous property', (_, result) => expect(result).toEqual({ name: 'Hello' }));

    bdd
      .given('an array of objects with dangerous properties nested', () =>
        JSON.parse('[{"inner":{"__proto__":{"polluted":true},"value":1}}]')
      )
      .when('deepFreeze() is called', value => deepFreeze(undefined, value))
      .then('should skip the nested dangerous property', (_, result) =>
        expect(result).toEqual([{ inner: { value: 1 } }])
      )
      .and('should not pollute Object.prototype', () => expect({}).not.toHaveProperty('polluted'));

    bdd
      .given('an object with the same object appearing twice but not recursive', () => {
        const shared = { value: 1 };

        return { array: [shared, shared], one: shared, two: shared };
      })
      .when('deepFreeze() is called', value => deepFreeze(undefined, value))
      .then('should copy every occurrence', (_, result) =>
        expect(result).toEqual({ array: [{ value: 1 }, { value: 1 }], one: { value: 1 }, two: { value: 1 } })
      )
      .and('should deeply freeze every occurrence', (_, result) => {
        expect(Object.isFrozen(result.one)).toBe(true);
        expect(Object.isFrozen(result.two)).toBe(true);
        expect(Object.isFrozen(result.array[0])).toBe(true);
        expect(Object.isFrozen(result.array[1])).toBe(true);
      });

    bdd
      .given('a recursive object', () => {
        const value: { name: string; self?: unknown } = { name: 'Hello' };

        value.self = value;

        return value;
      })
      .when('deepFreeze() is called', value => deepFreeze(undefined, value))
      .then('should return a copy', (value, result) => expect(result).not.toBe(value))
      .and('should point the recursive reference to the copy', (_, result) => expect(result.self).toBe(result))
      .and('should be frozen', (_, result) => expect(Object.isFrozen(result)).toBe(true));

    bdd
      .given('a recursive array', () => {
        const value: unknown[] = [1];

        value.push(value);

        return value;
      })
      .when('deepFreeze() is called', value => deepFreeze(undefined, value))
      .then('should return a copy', (value, result) => expect(result).not.toBe(value))
      .and('should point the recursive reference to the copy', (_, result) => {
        expect(result[0]).toBe(1);
        expect(result[1]).toBe(result);
      })
      .and('should be frozen', (_, result) => expect(Object.isFrozen(result)).toBe(true));

    bdd
      .given('an indirectly recursive object through an array', () => {
        const parent: { children: unknown[]; name: string } = { children: [], name: 'parent' };
        const child = { name: 'child', parent };

        parent.children.push(child, child);

        return parent;
      })
      .when('deepFreeze() is called', value => deepFreeze(undefined, value))
      .then('should point the recursive references to the copy', (_, result) => {
        expect(Reflect.get(result.children[0] as object, 'parent')).toBe(result);
        expect(Reflect.get(result.children[1] as object, 'parent')).toBe(result);
      })
      .and('should freeze every copy', (_, result) => {
        expect(Object.isFrozen(result)).toBe(true);
        expect(Object.isFrozen(result.children)).toBe(true);
        expect(Object.isFrozen(result.children[0])).toBe(true);
      });

    bdd
      .given('a deeply frozen recursive object', () => {
        const value: { name: string; self?: unknown } = { name: 'Hello' };

        value.self = value;

        return Object.freeze(value);
      })
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should return a copy', (value, result) => expect(result).not.toBe(value))
      .and('should point the recursive reference to the copy', (_, result) => expect(result.self).toBe(result));

    bdd
      .given('a recursive Set', () => {
        const value = new Set<unknown>();

        value.add({ value });

        return value;
      })
      .when('deepFreeze() is called', value => {
        try {
          return deepFreeze(undefined, value);
        } catch (error) {
          return error;
        }
      })
      .then('should throw', (_, result) => expect(result).toEqual(new TypeError('Recursive Set cannot be frozen')));

    bdd
      .given('a sparse array', () => {
        const array: number[] = [];

        array[0] = 1;
        array[2] = 3;

        return array;
      })
      .when('deepFreeze() is called', value => deepFreeze(undefined, value))
      .then('should return a dense frozen copy', (_, result) => {
        expect(result).toEqual([1, undefined, 3]);
        expect(Object.keys(result)).toEqual(['0', '1', '2']);
        expect(Object.isFrozen(result)).toBe(true);
      });

    bdd
      .given('a primitive value', () => 'Hello')
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should return the value as-is', (value, result) => expect(result).toBe(value));
  },
  NodeTest
);

scenario(
  'deepFreeze with { clone: false }',
  bdd => {
    bdd
      .given('a mutable value', () => {
        const items = [1, { two: 2 }];

        return { items, value: { items, name: 'Hello' } };
      })
      .when('deepFreeze() is called', ({ value }) => deepFreeze(value, value, { clone: false }))
      .then('should return the original value', ({ value }, result) => expect(result).toBe(value))
      .and('should freeze nested arrays and objects in place', ({ items }, result) => {
        expect(result.items).toBe(items);
        expect(Object.isFrozen(result)).toBe(true);
        expect(Object.isFrozen(items)).toBe(true);
        expect(Object.isFrozen(items[1])).toBe(true);
      });

    bdd
      .given('a mutable value and a validated copy without undefined', () => {
        const items = [1, undefined];

        return {
          copy: { items: [1, null], name: 'Hello' },
          items,
          value: { [Symbol('hidden')]: 'x', extra: undefined, items, name: 'Hello' }
        };
      })
      .when('deepFreeze() is called', ({ copy, value }) => deepFreeze(value, copy, { clone: false }))
      .then('should return the original value', ({ value }, result) => expect(result).toBe(value))
      .and('should apply the validated value in place', ({ items }, result) => {
        expect(result.items).toBe(items);
        expect(items).toEqual([1, null]);
        expect(Reflect.ownKeys(result)).toEqual(['items', 'name']);
      });

    bdd
      .given('a mutable value with dangerous keys', () => JSON.parse('{"__proto__":{"polluted":1},"one":1}'))
      .when('deepFreeze() is called', value => deepFreeze(value, value, { clone: false }))
      .then('should return the original value', (value, result) => expect(result).toBe(value))
      .and('should delete dangerous keys', (_, result) => {
        expect(Object.keys(result)).toEqual(['one']);
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      });

    bdd
      .given('a mutable value with a getter', () => {
        let numCalls = 0;
        const value = {
          get two() {
            numCalls++;

            return 2;
          }
        };

        return { getNumCalls: () => numCalls, value };
      })
      .when('deepFreeze() is called with a validated copy', ({ value }) =>
        deepFreeze(value, { two: 2 }, { clone: false })
      )
      .then('should replace the getter with a data property', ({ value }, result) => {
        expect(result).toBe(value);
        expect(Object.getOwnPropertyDescriptor(result, 'two')).toEqual({
          configurable: false,
          enumerable: true,
          value: 2,
          writable: false
        });
      })
      .and('should not call the getter', ({ getNumCalls }) => expect(getNumCalls()).toBe(0));

    bdd
      .given('a mutable value with a sealed object and a class instance', () => {
        class Point {
          x = 1;
        }

        const point = new Point();
        const sealed = Object.seal({ one: 1 });

        return { point, sealed, value: { point, sealed } };
      })
      .when('deepFreeze() is called', ({ value }) => deepFreeze(value, value, { clone: false }))
      .then('should freeze the outer object in place', ({ value }, result) => expect(result).toBe(value))
      .and('should clone the objects which cannot be frozen in place as plain objects', ({ point, sealed }, result) => {
        expect(result.point).not.toBe(point);
        expect(Object.getPrototypeOf(result.point)).toBe(Object.prototype);
        expect(result.point).toEqual({ x: 1 });
        expect(result.sealed).not.toBe(sealed);
        expect(Object.isFrozen(sealed)).toBe(false);
      });

    bdd
      .given('a mutable value with a non-configurable property to be replaced', () => {
        const value = { one: [1], two: 2 };

        // A sealed array cannot be frozen in place, the property must be replaced by a frozen copy.
        Object.defineProperty(value, 'two', { configurable: false, enumerable: true, value: Object.seal([2]) });

        return value;
      })
      .when('deepFreeze() is called', value => deepFreeze(value, value, { clone: false }))
      .then('should fall back to a frozen copy', (value, result) => {
        expect(result).not.toBe(value);
        expect(result).toEqual({ one: [1], two: [2] });
        expect(Object.isFrozen(result)).toBe(true);
      })
      .and('should still freeze nested values in place', (value, result) => {
        expect(result.one).toBe(value.one);
        expect(Object.isFrozen(value.one)).toBe(true);
      });

    bdd
      .given('a mutable value with a non-configurable extra property', () => {
        const value = { one: 1 };

        Object.defineProperty(value, 'hidden', { configurable: false, enumerable: false, value: 'x' });

        return value;
      })
      .when('deepFreeze() is called', value => deepFreeze(value, value, { clone: false }))
      .then('should fall back to a frozen plain copy', (value, result) => {
        expect(result).not.toBe(value);
        expect(Reflect.ownKeys(result)).toEqual(['one']);
        expect(Object.isFrozen(result)).toBe(true);
      });

    bdd
      .given('a mutable recursive value', () => {
        const value: { items: unknown[]; self?: unknown } = { items: [] };

        value.self = value;
        value.items.push(value.items, value);

        return value;
      })
      .when('deepFreeze() is called', value => deepFreeze(value, value, { clone: false }))
      .then('should freeze in place and keep recursive references', (value, result) => {
        expect(result).toBe(value);
        expect(result.self).toBe(result);
        expect(result.items[0]).toBe(result.items);
        expect(result.items[1]).toBe(result);
        expect(Object.isFrozen(result.items)).toBe(true);
      });

    bdd
      .given('a mutable recursive value with a non-configurable property to be replaced after the recursion', () => {
        const value: { self?: unknown; two?: unknown } = {};

        value.self = value;
        // A sealed array cannot be frozen in place, the property must be replaced by a frozen copy.
        Object.defineProperty(value, 'two', { configurable: false, enumerable: true, value: Object.seal([2]) });

        return value;
      })
      .when('deepFreeze() is called', value => {
        try {
          return deepFreeze(value, value, { clone: false });
        } catch (error) {
          return error;
        }
      })
      .then('should throw', (_, result) =>
        expect(result).toEqual(
          new TypeError('Recursive value cannot be frozen in place as some of its properties cannot be redefined')
        )
      );

    bdd
      .given('a mutable value which is shared', () => {
        const shared = { one: 1 };

        return { shared, value: { a: shared, b: shared } };
      })
      .when('deepFreeze() is called', ({ value }) => deepFreeze(value, value, { clone: false }))
      .then('should keep the shared object shared', ({ shared }, result) => {
        expect(result.a).toBe(shared);
        expect(result.b).toBe(shared);
      });

    bdd
      .given('a mutable Set', () => {
        const set = new Set([1]);

        return { set, value: { set } };
      })
      .when('deepFreeze() is called', ({ value }) => deepFreeze(value, value, { clone: false }))
      .then('should replace the Set with a read-only Set', ({ set, value }, result) => {
        expect(result).toBe(value);
        expect(result.set).not.toBe(set);
        expect(() => (result.set as Set<number>).add(2)).toThrow(TypeError);
      });

    bdd
      .given('a mutable value', () => ({ items: [1] }))
      .when('deepFreeze() is called without options', value => deepFreeze(value, value))
      .then('should return a frozen copy', (value, result) => {
        expect(result).not.toBe(value);
        expect(Object.isFrozen(result.items)).toBe(true);
      })
      .and('should not modify the original value', value => {
        expect(Object.isFrozen(value)).toBe(false);
        expect(Object.isFrozen(value.items)).toBe(false);
      });
  },
  NodeTest
);
