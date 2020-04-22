import concatArrayBuffer from './concatArrayBuffer';

test('no ArrayBuffer', () => {
  const actual = concatArrayBuffer();

  expect(actual).toBeInstanceOf(ArrayBuffer);
  expect(actual).toHaveProperty('byteLength', 0);
});

test('one ArrayBuffer', () => {
  const actual = concatArrayBuffer(new Uint8Array([1, 2, 3]).buffer);

  expect(actual).toBeInstanceOf(ArrayBuffer);
  expect(actual).toHaveProperty('byteLength', 3);
  expect([...new Uint8Array(actual)]).toEqual([1, 2, 3]);
});

test('two ArrayBuffer', () => {
  const actual = concatArrayBuffer(new Uint8Array([1, 2, 3]).buffer, new Uint8Array([4, 5, 6]).buffer);

  expect(actual).toBeInstanceOf(ArrayBuffer);
  expect(actual).toHaveProperty('byteLength', 6);
  expect([...new Uint8Array(actual)]).toEqual([1, 2, 3, 4, 5, 6]);
});
