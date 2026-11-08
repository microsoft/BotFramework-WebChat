import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import FrozenSet, { isFrozenSet } from './FrozenSet.ts';

scenario(
  'new FrozenSet()',
  bdd => {
    bdd
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
      .when('read', set => set)
      .then('should be instance of Set', (_, set) => expect(set).toBeInstanceOf(Set))
      .and('should be detected as readonly set', (_, set) => expect(isFrozenSet(set)).toBe(true))
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
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
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
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
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
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
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
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
      .when('a property is set via Reflect.set()', set => Reflect.set(set, 'add', () => undefined))
      .then('should fail', (_, result) => expect(result).toBe(false))
      .and('add() should still throw', set => expect(() => (set as unknown as Set<number>).add(4)).toThrow(TypeError));

    bdd
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
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
      .when('checked', set => isFrozenSet(set))
      .then('should not be detected as readonly set', (_, result) => expect(result).toBe(false));

    bdd
      .given('a mutable set', () => new Set([1, 2, 3]))
      .when('a readonly set is created from it and the original set is modified', mutableSet => {
        const readonlySet = new FrozenSet(mutableSet);

        mutableSet.add(4);

        return readonlySet;
      })
      .then('should not reflect the change', (_, readonlySet) => expect(Array.from(readonlySet)).toEqual([1, 2, 3]));

    bdd
      .given('a mutable set', () => new Set([1, 2, 3]))
      .when('checked', set => isFrozenSet(set))
      .then('should not be detected as readonly set', (_, result) => expect(result).toBe(false));
  },
  NodeTest
);

scenario(
  'new FrozenSet() with nullish or invalid iterable',
  bdd => {
    bdd
      .given('nothing', () => undefined)
      .when.oneOf<ReadonlySet<unknown>>([
        ['constructed without arguments', () => new FrozenSet()],
        ['constructed with null', () => new FrozenSet(null)]
      ])
      .then('should be empty', (_, set) => expect(set.size).toBe(0))
      .and('should be detected as readonly set', (_, set) => expect(isFrozenSet(set)).toBe(true));

    bdd
      .given('a non-iterable value', () => 1)
      .when('constructed', value => () => new FrozenSet(value as unknown as Iterable<unknown>))
      .then('should throw TypeError', (_, fn) => expect(fn).toThrow(TypeError));

    bdd
      .given('a committed set', () => new FrozenSet([1]).mutate().add(2).commit())
      .when('another set is constructed without arguments', () => new FrozenSet())
      .then('should not share storage with the committed set', (committed, set) => {
        expect(set.size).toBe(0);
        expect(committed.size).toBe(2);
      });
  },
  NodeTest
);

scenario(
  'FrozenSet.mutate()',
  bdd => {
    bdd
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
      .when('mutated without commit', set => set.mutate().add(4).add(2))
      .then('overlay should read changes', (_, readWriteSet) => {
        expect(readWriteSet.size).toBe(4);
        expect(readWriteSet.has(4)).toBe(true);
        expect(Array.from(readWriteSet)).toEqual([1, 2, 3, 4]);
      })
      .and('original set should not be modified', set => {
        expect(set.size).toBe(3);
        expect(set.has(4)).toBe(false);
        expect(Array.from(set)).toEqual([1, 2, 3]);
      });

    bdd
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
      .when('mutated and committed', set => {
        const readWriteSet = set.mutate();

        readWriteSet.add(4);
        readWriteSet.delete(1);
        readWriteSet.delete(5);

        return { nextSet: readWriteSet.commit(), readWriteSet };
      })
      .then('should return a new readonly set with changes', (_, { nextSet }) => {
        expect(nextSet).not.toBe(_);
        expect(isFrozenSet(nextSet)).toBe(true);
        expect(Object.isFrozen(nextSet)).toBe(true);
        expect(nextSet.size).toBe(3);
        expect(nextSet).toEqual(new Set([2, 3, 4]));
      })
      .and('original set should not be modified', set => {
        expect(set.size).toBe(3);
        expect(set.has(1)).toBe(true);
        expect(set.has(4)).toBe(false);
        expect(set).toEqual(new Set([1, 2, 3]));
      })
      .and('overlay should not be modifiable after commit', (_, { readWriteSet }) => {
        expect(() => readWriteSet.add(5)).toThrow('already committed');
        expect(() => readWriteSet.delete(2)).toThrow('already committed');
        expect(() => readWriteSet.commit()).toThrow('already committed');
      })
      .and('overlay should still be readable after commit', (_, { readWriteSet }) =>
        expect(readWriteSet).toEqual(new Set([2, 3, 4]))
      );

    bdd
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
      .when('mutated and committed multiple times', set => {
        const set2 = set.mutate().add(4).commit();
        const readWriteSet3 = set2.mutate();

        readWriteSet3.delete(2);

        const set3 = readWriteSet3.commit();

        return [set, set2, set3, set3.mutate().add(2).commit()];
      })
      .then('every version should keep its own values', (_, sets) => {
        expect(sets.map(set => Array.from(set).sort())).toEqual([
          [1, 2, 3],
          [1, 2, 3, 4],
          [1, 3, 4],
          [1, 2, 3, 4]
        ]);
        expect(sets.map(set => set.size)).toEqual([3, 4, 3, 4]);
        expect(sets.map(set => set.has(2))).toEqual([true, true, false, true]);
        expect(sets.map(set => set.has(4))).toEqual([false, true, true, true]);
      })
      .and('reading older versions again should return the same values', (_, sets) =>
        expect(sets.map(set => Array.from(set).sort())).toEqual([
          [1, 2, 3],
          [1, 2, 3, 4],
          [1, 3, 4],
          [1, 2, 3, 4]
        ])
      );

    bdd
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
      .when('mutated twice from the same set and both committed', set => [
        set.mutate().add(4).commit(),
        set.mutate().add(5).commit()
      ])
      .then('both versions should have their own changes', (_, [set4, set5]) => {
        expect(set4).toEqual(new Set([1, 2, 3, 4]));
        expect(set5).toEqual(new Set([1, 2, 3, 5]));
      })
      .and('original set should not be modified', set => expect(set).toEqual(new Set([1, 2, 3])))
      .and('should be able to mutate the branched version', (_, [, set5]) =>
        expect(set5!.mutate().add(6).commit()).toEqual(new Set([1, 2, 3, 5, 6]))
      );

    bdd
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
      .when('cleared and committed', set => {
        const readWriteSet = set.mutate();

        readWriteSet.clear();
        readWriteSet.add(4);

        return readWriteSet.commit();
      })
      .then('should only have new values', (_, nextSet) => expect(nextSet).toEqual(new Set([4])))
      .and('original set should not be modified', set => expect(set).toEqual(new Set([1, 2, 3])));

    bdd
      .given('a readonly set', () => new FrozenSet([1, 2, 3]))
      .when('a value is added then deleted in the overlay', set => {
        const readWriteSet = set.mutate().add(4);

        readWriteSet.delete(4);

        return readWriteSet;
      })
      .then('should not have the value', (_, readWriteSet) => {
        expect(readWriteSet.has(4)).toBe(false);
        expect(readWriteSet.size).toBe(3);
      })
      .and('should commit without the value', (_, readWriteSet) =>
        expect(readWriteSet.commit()).toEqual(new Set([1, 2, 3]))
      );
  },
  NodeTest
);
