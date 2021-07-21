/** @jest-environment jsdom */

import float32ArraysToPcmWaveArrayBuffer from './float32ArraysToPcmWaveArrayBuffer';

beforeAll(() => {
  // When running under JSDOM, the ArrayBuffer and Uint8Array.buffer doesn't match.
  // This code is to pair them up.
  global.ArrayBuffer = new Uint8Array().buffer.constructor;
});

test('single channel', () => {
  const float32Array = new Float32Array([0, -1, 1, 0]);
  const result = float32ArraysToPcmWaveArrayBuffer([float32Array]);

  expect(result).toBeInstanceOf(ArrayBuffer);
  expect([...new Int16Array(result)]).toEqual([0, -32768, 32767, 0]);
});
