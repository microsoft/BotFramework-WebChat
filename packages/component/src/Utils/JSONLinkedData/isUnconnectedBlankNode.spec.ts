/// <reference types="jest" />

import isUnconnectedBlankNode from './isUnconnectedBlankNode';

test('passing a blank node identifier should return true', () =>
  expect(isUnconnectedBlankNode({ '@id': '_:b1' })).toBe(true));

test('passing a blank node should return false', () =>
  expect(isUnconnectedBlankNode({ '@id': '_:b1', name: 'John Doe' })).toBe(false));

test('passing a number should return false', () => expect(isUnconnectedBlankNode(0 as any)).toBe(false));

test('passing a function should return false', () => expect(isUnconnectedBlankNode((() => 0) as any)).toBe(false));

test('passing a string should return false', () => expect(isUnconnectedBlankNode('Hello, World!' as any)).toBe(false));
