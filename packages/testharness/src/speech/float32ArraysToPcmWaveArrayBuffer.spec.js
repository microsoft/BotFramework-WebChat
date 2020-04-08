import float32ArrayToPcmWaveArrayBuffer from './float32ArrayToPcmWaveArrayBuffer';

test('single channel', () => {
  const float32Array = new Float32Array([0, -1, 1, 0]);
  const result = float32ArrayToPcmWaveArrayBuffer([float32Array]);

  expect(result).toBeInstanceOf(ArrayBuffer);
  expect([...new Int16Array(result)]).toEqual([0, -32768, 32767, 0]);
});
