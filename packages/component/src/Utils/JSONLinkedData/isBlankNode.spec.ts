import isBlankNode from './isBlankNode';

test('passing an object with @id of "_:b1" should return true', () =>
  expect(isBlankNode({ '@id': '_:b1' })).toBe(true));

test('passing an object with @id of "https://example.com/" should return false', () =>
  expect(isBlankNode({ '@id': 'https://example.com/' })).toBe(false));

test('passing an object without @id should return false', () => expect(isBlankNode({})).toBe(false));

test('passing an object with @id of a number should return false', () =>
  expect(isBlankNode({ '@id': 123 })).toBe(false));

test('passing a number should return false', () => expect(isBlankNode(0)).toBe(false));

test('passing a function should return false', () => expect(isBlankNode(() => 0)).toBe(false));

test('passing a string should return false', () => expect(isBlankNode('Hello, World!')).toBe(false));
