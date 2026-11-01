import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import createReadonlySet, { isReadonlySet } from './createReadonlySet.ts';

scenario(
  'createReadonlySet',
  bdd => {
    bdd
      .given('a readonly set', () => createReadonlySet([1, 2, 3]))
      .when('read', set => set)
      .then('should be instance of Set', (_, set) => expect(set).toBeInstanceOf(Set))
      .and('should be detected as readonly set', (_, set) => expect(isReadonlySet(set)).toBe(true))
      .and('should be frozen', (_, set) => expect(Object.isFrozen(set)).toBe(true))
      .and('should have size', (_, set) => expect(set.size).toBe(3))
      .and('should support has()', (_, set) => {
        expect(set.has(1)).toBe(true);
        expect(set.has(4)).toBe(false);
      })
      .and('should be iterable', (_, set) => expect(Array.from(set)).toEqual([1, 2, 3]))
      .and('should support forEach()', (_, set) => {
        const values: number[] = [];

        set.forEach(value => values.push(value));

        expect(values).toEqual([1, 2, 3]);
      })
      .and('should support entries(), keys(), and values()', (_, set) => {
        expect(Array.from(set.entries())).toEqual([
          [1, 1],
          [2, 2],
          [3, 3]
        ]);
        expect(Array.from(set.keys())).toEqual([1, 2, 3]);
        expect(Array.from(set.values())).toEqual([1, 2, 3]);
      })
      .and('should equal to a Set with same values', (_, set) => expect(set).toEqual(new Set([1, 2, 3])))
      .and('should have stable method reference', (_, set) => expect(set.has).toBe(set.has));

    bdd
      .given('a readonly set', () => createReadonlySet([1, 2, 3]))
      .when('modified via add(), clear(), or delete()', set => {
        const mutableSet = set as unknown as Set<number>;

        return [() => mutableSet.add(4), () => mutableSet.clear(), () => mutableSet.delete(1)];
      })
      .then('should throw', (_, modifiers) => {
        for (const modify of modifiers) {
          expect(modify).toThrow(TypeError);
        }
      })
      .and('should not be modified', set => expect(Array.from(set)).toEqual([1, 2, 3]));

    bdd
      .given('a readonly set', () => createReadonlySet([1, 2, 3]))
      .when('modified via Set.prototype', set => [
        () => Set.prototype.add.call(set, 4),
        () => Set.prototype.clear.call(set),
        () => Set.prototype.delete.call(set, 1)
      ])
      .then('should throw', (_, modifiers) => {
        for (const modify of modifiers) {
          expect(modify).toThrow(TypeError);
        }
      })
      .and('should not be modified', set => expect(Array.from(set)).toEqual([1, 2, 3]));

    bdd
      .given('a readonly set', () => createReadonlySet([1, 2, 3]))
      .when('properties or prototype are modified', set => [
        () => Object.defineProperty(set, 'add', { value: () => undefined }),
        () => Object.setPrototypeOf(set, null)
      ])
      .then('should throw', (_, modifiers) => {
        for (const modify of modifiers) {
          expect(modify).toThrow(TypeError);
        }
      })
      .and('should still be a Set', set => expect(set).toBeInstanceOf(Set));

    bdd
      .given('a readonly set', () => createReadonlySet([1, 2, 3]))
      .when('a property is set via Reflect.set()', set => Reflect.set(set, 'add', () => undefined))
      .then('should fail', (_, result) => expect(result).toBe(false))
      .and('add() should still throw', set => expect(() => (set as Set<number>).add(4)).toThrow(TypeError));

    bdd
      .given('a readonly set', () => createReadonlySet([1, 2, 3]))
      .when('Set.prototype methods are called', set => set)
      .then('should not have own properties', (_, set) => expect(Reflect.ownKeys(set)).toEqual([]))
      .and('should have a "Set" string tag', (_, set) =>
        expect(Object.prototype.toString.call(set)).toBe('[object Set]')
      )
      .and('should be copied by new Set()', (_, set) => expect(new Set(set)).toEqual(new Set([1, 2, 3])))
      .and('should support union()', (_, set) => expect(set.union(new Set([4]))).toEqual(new Set([1, 2, 3, 4])))
      .and('should be accepted by Set.prototype.union()', (_, set) =>
        expect(new Set([4]).union(set)).toEqual(new Set([4, 1, 2, 3]))
      )
      .and('should support isSubsetOf()', (_, set) => expect(set.isSubsetOf(new Set([1, 2, 3, 4]))).toBe(true))
      .and('should pass itself to forEach() callback', (_, set) =>
        set.forEach((_value, _value2, target) => expect(target).toBe(set))
      );

    bdd
      .given('a frozen subclass of Set', () => Object.freeze(new (class extends Set<number> {})([1, 2, 3])))
      .when('checked', set => isReadonlySet(set))
      .then('should not be detected as readonly set', (_, result) => expect(result).toBe(false));

    bdd
      .given('a mutable set', () => new Set([1, 2, 3]))
      .when('a readonly set is created from it and the original set is modified', mutableSet => {
        const readonlySet = createReadonlySet(mutableSet);

        mutableSet.add(4);

        return readonlySet;
      })
      .then('should not reflect the change', (_, readonlySet) => expect(Array.from(readonlySet)).toEqual([1, 2, 3]));

    bdd
      .given('a mutable set', () => new Set([1, 2, 3]))
      .when('checked', set => isReadonlySet(set))
      .then('should not be detected as readonly set', (_, result) => expect(result).toBe(false));
  },
  NodeTest
);
