import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import VersionedArray from './VersionedArray.ts';

function toArray<T>(array: VersionedArray<T>): T[] {
  return Array.from({ length: array.length }, (_, index) => array.at(index) as T);
}

scenario(
  'VersionedArray',
  bdd => {
    bdd
      .given('a versioned array', () => new VersionedArray(['a', 'b', 'c']))
      .when('read', array => array)
      .then('should have length', (_, array) => expect(array.length).toBe(3))
      .and('should return items', (_, array) => expect(toArray(array)).toEqual(['a', 'b', 'c']))
      .and('should return undefined when out of range', (_, array) => {
        expect(array.at(-1)).toBeUndefined();
        expect(array.at(3)).toBeUndefined();
      });

    bdd
      .given('a versioned array', () => new VersionedArray(['a', 'b', 'c']))
      .when('splice() is called', array => array.splice(1, 1, 'x', 'y'))
      .then('should return a new version with items replaced', (_, next) =>
        expect(toArray(next)).toEqual(['a', 'x', 'y', 'c'])
      )
      .and('should keep the previous version intact', array => {
        expect(array.length).toBe(3);
        expect(toArray(array)).toEqual(['a', 'b', 'c']);
      });

    bdd
      .given('a versioned array', () => new VersionedArray<number>())
      .when('100 items are appended one by one', array => {
        const versions = [array];

        for (let index = 0; index < 100; index++) {
          versions.push((versions.at(-1) as VersionedArray<number>).splice(index, 0, index));
        }

        return versions;
      })
      .then('every version should keep its own items', (_, versions) =>
        versions.forEach((version, length) =>
          expect(toArray(version)).toEqual(Array.from({ length }, (_, index) => index))
        )
      );

    bdd
      .given('a versioned array with a newer version', () => {
        const array = new VersionedArray(['a', 'b']);

        return { array, next: array.splice(2, 0, 'c') };
      })
      .when('the old version is modified', ({ array }) => array.splice(0, 1))
      .then('should branch from the old version', (_, branch) => expect(toArray(branch)).toEqual(['b']))
      .and('should keep the old version intact', ({ array }) => expect(toArray(array)).toEqual(['a', 'b']))
      .and('should keep the newer version intact', ({ next }) => expect(toArray(next)).toEqual(['a', 'b', 'c']));

    bdd
      .given('a versioned array', () => new VersionedArray(['a', 'b', 'c', 'd']))
      .when('items are inserted and removed in multiple versions', array => [
        array,
        array.splice(0, 1).splice(1, 0, 'x').splice(3, 1, 'y', 'z')
      ])
      .then('should apply all changes', (_, [, last]) => expect(toArray(last!)).toEqual(['b', 'x', 'c', 'y', 'z']))
      .and('should keep the first version intact', (_, [first]) =>
        expect(toArray(first!)).toEqual(['a', 'b', 'c', 'd'])
      );
  },
  NodeTest
);
