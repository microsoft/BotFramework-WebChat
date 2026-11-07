import { scenario } from '@testduet/given-when-then';
import insertSorted from './insertSorted';

scenario('insert to sorted array', bdd => {
  bdd
    .given('a sorted array of [1, 3, 5]', () => [1, 3, 5])
    .when('inserting 2', array => insertSorted(array, 2, (x, y) => x - y))
    .then('should return [1, 2, 3, 5]', (_, actual) => {
      expect(actual).toEqual([1, 2, 3, 5]);
    });

  bdd
    .given('a sorted array of [1, 3, 5]', () => [1, 3, 5])
    .when('inserting 6', array => insertSorted(array, 6, (x, y) => x - y))
    .then('should return [1, 3, 5, 6]', (_, actual) => {
      expect(actual).toEqual([1, 3, 5, 6]);
    });

  bdd
    .given('a sorted array of [1, 3, 5]', () => [1, 3, 5])
    .when('inserting 0', array => insertSorted(array, 0, (x, y) => x - y))
    .then('should return [0, 1, 3, 5]', (_, actual) => {
      expect(actual).toEqual([0, 1, 3, 5]);
    });

  bdd
    .given('an empty array', () => [])
    .when('inserting 0', array => insertSorted(array, 0, (x, y) => x - y))
    .then('should return [0]', (_, actual) => {
      expect(actual).toEqual([0]);
    });

  bdd
    .given("a sorted array of ['1b', '2b', '3b']", () => ['1b', '2b', '3b'])
    .when('inserting 2c with a parseInt comparer', array =>
      insertSorted(array, '2c', (x, y) => parseInt(x, 10) - parseInt(y, 10))
    )
    .then("should return ['1b', '2b', '2c', '3b']", (_, actual) => {
      expect(actual).toEqual(['1b', '2b', '2c', '3b']);
    });

  bdd
    .given("a sorted array of ['1b', '2b', '3b']", () => ['1b', '2b', '3b'])
    .when('inserting 2a with a parseInt comparer', array =>
      insertSorted(array, '2a', (x, y) => parseInt(x, 10) - parseInt(y, 10))
    )
    .then("should return ['1b', '2b', '2a', '3b']", (_, actual) => {
      // For items with same weight, the new item should be appended.
      expect(actual).toEqual(['1b', '2b', '2a', '3b']);
    });
});

scenario('insert to sorted array ignoring undefined elements with a custom compareFn', bdd => {
  function compareFn(x: number | undefined, y: number | undefined): number {
    return typeof x === 'undefined' || typeof y === 'undefined' ? -1 : x - y;
  }

  bdd
    .given('a sorted array of [1, undefined, 3, undefined, 5]', () => [1, undefined, 3, undefined, 5])
    .when('inserting 2', array => insertSorted(array, 2, compareFn))
    .then('should return [1, undefined, 2, 3, undefined, 5]', (_, actual) => {
      expect(actual).toEqual([1, undefined, 2, 3, undefined, 5]);
    });

  bdd
    .given('a sorted array of [1, undefined, 3, undefined, 5]', () => [1, undefined, 3, undefined, 5])
    .when('inserting 4', array => insertSorted(array, 4, compareFn))
    .then('should return [1, undefined, 3, undefined, 4, 5]', (_, actual) => {
      expect(actual).toEqual([1, undefined, 3, undefined, 4, 5]);
    });

  bdd
    .given('a sorted array of [undefined, 3, undefined]', () => [undefined, 3, undefined])
    .when('inserting 2', array => insertSorted(array, 2, compareFn))
    .then('should return [undefined, 2, 3, undefined]', (_, actual) => {
      expect(actual).toEqual([undefined, 2, 3, undefined]);
    });

  bdd
    .given('a sorted array of [undefined, 3, undefined]', () => [undefined, 3, undefined])
    .when('inserting 4', array => insertSorted(array, 4, compareFn))
    .then('should return [undefined, 3, undefined, 4]', (_, actual) => {
      expect(actual).toEqual([undefined, 3, undefined, 4]);
    });

  bdd
    .given('a sorted array of [1, 3, 5]', () => [1, 3, 5])
    .when('inserting undefined', array => insertSorted(array, undefined, compareFn))
    .then('should return [1, 3, 5, undefined]', (_, actual) => {
      expect(actual).toEqual([1, 3, 5, undefined]);
    });

  bdd
    .given('a sorted array of [1, undefined, 3, undefined, 5]', () => [1, undefined, 3, undefined, 5])
    .when('inserting undefined', array => insertSorted(array, undefined, compareFn))
    .then('should return [1, undefined, 3, undefined, 5, undefined]', (_, actual) => {
      expect(actual).toEqual([1, undefined, 3, undefined, 5, undefined]);
    });

  bdd
    .given('an array of [undefined]', () => [undefined])
    .when('inserting undefined', array => insertSorted(array, undefined, compareFn))
    .then('should return [undefined, undefined]', (_, actual) => {
      expect(actual).toEqual([undefined, undefined]);
    });
});
