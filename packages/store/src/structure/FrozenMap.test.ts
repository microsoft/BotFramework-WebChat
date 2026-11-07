import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import FrozenMap, { isFrozenMap } from './FrozenMap.ts';

scenario(
  'new FrozenMap()',
  bdd => {
    bdd
      .given(
        'a readonly map',
        () =>
          new FrozenMap([
            ['a', 1],
            ['b', 2]
          ])
      )
      .when('read', map => map)
      .then('should be instance of Map', (_, map) => expect(map).toBeInstanceOf(Map))
      .and('should be detected as readonly map', (_, map) => expect(isFrozenMap(map)).toBe(true))
      .and('should be frozen', (_, map) => expect(Object.isFrozen(map)).toBe(true))
      .and('should have size', (_, map) => expect(map.size).toBe(2))
      .and('should support get() and has()', (_, map) => {
        expect(map.get('a')).toBe(1);
        expect(map.get('c')).toBeUndefined();
        expect(map.has('b')).toBe(true);
        expect(map.has('c')).toBe(false);
      })
      .and('should support entries(), keys(), and values()', (_, map) => {
        expect(Array.from(map)).toEqual([
          ['a', 1],
          ['b', 2]
        ]);
        expect(Array.from(map.entries())).toEqual(Array.from(map));
        expect(Array.from(map.keys())).toEqual(['a', 'b']);
        expect(Array.from(map.values())).toEqual([1, 2]);
      })
      .and('should support forEach()', (_, map) => {
        const entries: [string, number, ReadonlyMap<string, number>][] = [];

        map.forEach((value, key, target) => entries.push([key, value, target]));

        expect(entries).toEqual([
          ['a', 1, map],
          ['b', 2, map]
        ]);
      })
      .and('should have a "Map" string tag', (_, map) =>
        expect(Object.prototype.toString.call(map)).toBe('[object Map]')
      )
      .and('should not have own properties', (_, map) => expect(Reflect.ownKeys(map)).toEqual([]))
      .and('should equal to a Map with same entries', (_, map) =>
        expect(map).toEqual(
          new Map([
            ['a', 1],
            ['b', 2]
          ])
        )
      );

    bdd
      .given('a readonly map', () => new FrozenMap([['a', 1]]))
      .when('modified via set(), clear(), delete(), or Map.prototype', map => {
        const mutableMap = map as unknown as Map<string, number>;

        return [
          () => mutableMap.set('b', 2),
          () => mutableMap.clear(),
          () => mutableMap.delete('a'),
          () => Map.prototype.set.call(map, 'b', 2),
          () => Map.prototype.clear.call(map),
          () => Map.prototype.delete.call(map, 'a')
        ];
      })
      .then('should throw', (_, modifiers) => {
        for (const modify of modifiers) {
          expect(modify).toThrow(TypeError);
        }
      })
      .and('should not be modified', map => expect(Array.from(map)).toEqual([['a', 1]]));

    bdd
      .given('a mutable map', () => new Map([['a', 1]]))
      .when('a readonly map is created from it and the original map is modified', mutableMap => {
        const readonlyMap = new FrozenMap(mutableMap);

        mutableMap.set('b', 2);

        return readonlyMap;
      })
      .then('should not reflect the change', (_, readonlyMap) => expect(Array.from(readonlyMap)).toEqual([['a', 1]]));

    bdd
      .given('a mutable map', () => new Map([['a', 1]]))
      .when('checked', map => isFrozenMap(map))
      .then('should not be detected as readonly map', (_, result) => expect(result).toBe(false));
  },
  NodeTest
);

scenario(
  'new FrozenMap() with nullish or invalid iterable',
  bdd => {
    bdd
      .given('nothing', () => undefined)
      .when.oneOf<ReadonlyMap<unknown, unknown>>([
        ['constructed without arguments', () => new FrozenMap()],
        ['constructed with null', () => new FrozenMap(null)]
      ])
      .then('should be empty', (_, map) => expect(map.size).toBe(0))
      .and('should be detected as readonly map', (_, map) => expect(isFrozenMap(map)).toBe(true));

    bdd
      .given('a non-iterable value', () => 1)
      .when('constructed', value => () => new FrozenMap(value as unknown as Iterable<[unknown, unknown]>))
      .then('should throw TypeError', (_, fn) => expect(fn).toThrow(TypeError));

    bdd
      .given('a committed map', () => new FrozenMap([['a', 1]]).mutate().set('b', 2).commit())
      .when('another map is constructed without arguments', () => new FrozenMap())
      .then('should not share storage with the committed map', (committed, map) => {
        expect(map.size).toBe(0);
        expect(committed.size).toBe(2);
      });
  },
  NodeTest
);

scenario(
  'FrozenMap.mutate()',
  bdd => {
    bdd
      .given(
        'a readonly map',
        () =>
          new FrozenMap([
            ['a', 1],
            ['b', 2],
            ['c', 3]
          ])
      )
      .when('mutated without commit', map => {
        const readWriteMap = map.mutate();

        readWriteMap.set('b', 20).set('d', 4);
        readWriteMap.delete('a');

        return readWriteMap;
      })
      .then('overlay should read changes', (_, readWriteMap) => {
        expect(readWriteMap.size).toBe(3);
        expect(readWriteMap.get('a')).toBeUndefined();
        expect(readWriteMap.has('a')).toBe(false);
        expect(readWriteMap.get('b')).toBe(20);
        expect(readWriteMap.get('d')).toBe(4);
        expect(Array.from(readWriteMap)).toEqual([
          ['b', 20],
          ['c', 3],
          ['d', 4]
        ]);
        expect(Array.from(readWriteMap.keys())).toEqual(['b', 'c', 'd']);
        expect(Array.from(readWriteMap.values())).toEqual([20, 3, 4]);
      })
      .and('original map should not be modified', map =>
        expect(Array.from(map)).toEqual([
          ['a', 1],
          ['b', 2],
          ['c', 3]
        ])
      );

    bdd
      .given(
        'a readonly map',
        () =>
          new FrozenMap([
            ['a', 1],
            ['b', 2],
            ['c', 3]
          ])
      )
      .when('mutated and committed', map => {
        const readWriteMap = map.mutate();

        readWriteMap.set('b', 20).set('d', 4);
        readWriteMap.delete('a');

        return { nextMap: readWriteMap.commit(), readWriteMap };
      })
      .then('should return a new readonly map with changes', (map, { nextMap }) => {
        expect(nextMap).not.toBe(map);
        expect(isFrozenMap(nextMap)).toBe(true);
        expect(Object.isFrozen(nextMap)).toBe(true);
        expect(nextMap.size).toBe(3);
        expect(Array.from(nextMap)).toEqual([
          ['b', 20],
          ['c', 3],
          ['d', 4]
        ]);
      })
      .and('original map should keep its entries', map => {
        expect(map.size).toBe(3);
        expect(map.get('a')).toBe(1);
        expect(map.get('b')).toBe(2);
        expect(map.has('d')).toBe(false);
        expect(map).toEqual(
          new Map([
            ['a', 1],
            ['b', 2],
            ['c', 3]
          ])
        );
      })
      .and('original map should keep the order of entries which are not deleted later', map =>
        expect(Array.from(map.keys())).toEqual(['b', 'c', 'a'])
      )
      .and('overlay should not be modifiable after commit', (_, { readWriteMap }) => {
        expect(() => readWriteMap.set('e', 5)).toThrow('already committed');
        expect(() => readWriteMap.clear()).toThrow('already committed');
        expect(() => readWriteMap.commit()).toThrow('already committed');
      });

    bdd
      .given('a readonly map', () => new FrozenMap([['a', 1]]))
      .when('mutated and committed multiple times', map => {
        const versions = [map];

        for (let index = 2; index <= 100; index++) {
          versions.push(versions[versions.length - 1]!.mutate().set('a', index).set(`key-${index}`, index).commit());
        }

        return versions;
      })
      .then('every version should keep its own entries', (_, versions) =>
        versions.forEach((version, index) => {
          expect(version.size).toBe(index + 1);
          expect(version.get('a')).toBe(index + 1);
          expect(version.has(`key-${index + 2}`)).toBe(false);
        })
      )
      .and('oldest version should iterate its own entries', (_, [version]) =>
        expect(Array.from(version!)).toEqual([['a', 1]])
      );

    bdd
      .given('a readonly map', () => new FrozenMap([['a', 1]]))
      .when('mutated twice from the same map and both committed', map => [
        map.mutate().set('b', 2).commit(),
        map.mutate().set('c', 3).commit()
      ])
      .then('both versions should have their own changes', (_, [mapB, mapC]) => {
        expect(Array.from(mapB!)).toEqual([
          ['a', 1],
          ['b', 2]
        ]);
        expect(Array.from(mapC!)).toEqual([
          ['a', 1],
          ['c', 3]
        ]);
      })
      .and('original map should not be modified', map => expect(Array.from(map)).toEqual([['a', 1]]));
  },
  NodeTest
);
