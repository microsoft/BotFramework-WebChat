import { parse } from './readDataURIToBlob';

test('Parse "data:,Hello%2C%20World!"', () => {
  const actual = parse('data:,Hello%2C%20World!');

  expect(actual).toBeUndefined();
});

test('Parse "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=="', () => {
  const actual = parse('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');

  expect(actual).toHaveProperty('base64', 'SGVsbG8sIFdvcmxkIQ==');
  expect(actual).toHaveProperty('contentType', 'text/plain');
  expect(actual).toHaveProperty('encoding', 'base64');
});

test('Parse "data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E"', () => {
  const actual = parse('data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E');

  expect(actual).toBeUndefined();
});

test('Parse "data:text/plain;charset=UTF-8;base64,SGVsbG8sIFdvcmxkIQ=="', () => {
  const actual = parse('data:text/plain;charset=UTF-8;base64,SGVsbG8sIFdvcmxkIQ==');

  expect(actual).toHaveProperty('base64', 'SGVsbG8sIFdvcmxkIQ==');
  expect(actual).toHaveProperty('contentType', 'text/plain;charset=UTF-8');
  expect(actual).toHaveProperty('encoding', 'base64');
});

test('Parse "data:text/plain;charset=UTF-8,Hello"', () => {
  const actual = parse('data:text/plain;charset=utf-8,Hello');

  expect(actual).toBeUndefined();
});

test('Parse "data:;base64,SGVsbG8sIFdvcmxkIQ=="', () => {
  const actual = parse('data:;base64,SGVsbG8sIFdvcmxkIQ==');

  expect(actual).toHaveProperty('base64', 'SGVsbG8sIFdvcmxkIQ==');
  expect(actual).toHaveProperty('contentType', 'text/plain;charset=US-ASCII');
  expect(actual).toHaveProperty('encoding', 'base64');
});
