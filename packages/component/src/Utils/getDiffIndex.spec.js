import getDiffIndex from './getDiffIndex';

describe('getDiffIndex', () => {
  test('recieves two strings where the first string is shorter than the second and returns a number', () => {
    const actual = getDiffIndex('Hello, world', 'Hello, world!!', 0);

    expect(actual).toEqual(12);
  });

  test('correctly returns index when diff is at beginning of the string', () => {
    const actual = getDiffIndex('Hello, world!!', '@Hello, world!!', 0);

    expect(actual).toEqual(1);
  });

  test('correctly returns index when diff is in the middle of the string', () => {
    const actual = getDiffIndex('Hello; world!!', 'Hello, world!!', 0);

    expect(actual).toEqual(5);
  });

  test('correctly returns index when index is not 0', () => {
    const actual = getDiffIndex('Hello; world!!', 'Hello, world!!', 3);

    expect(actual).toEqual(5);
  });

  test('will return the last parameter (number) if the first string is the same length as the second', () => {
    const actual = getDiffIndex('Hello, world', 'Hello, world', 12);

    expect(actual).toBe(12);
  });

  test('will return the last parameter (number) if the first string is the same length as the second and currentIndex is not the length of both strings', () => {
    const actual = getDiffIndex('Hello, world', 'Hello, world', 1);

    expect(actual).toBe(1);
  });

  test('will throw an error if the first string is longer than the second', () => {
    expect(() => getDiffIndex('Hello, world!!!', 'Hello, world', 0)).toThrow();
  });

  test('will throw an error if first parameter is not a string', () => {
    expect(() => getDiffIndex(42, 'Hello, world', 0)).toThrow();
  });

  test('will throw an error if second parameter is not a string', () => {
    expect(() => getDiffIndex('Hello, world', undefined, 0)).toThrow();
  });
});
