import pcmWaveArrayBufferToFloat32Arrays from './pcmWaveArrayBufferToFloat32Arrays';

test('1 channel', () => {
  const actual = pcmWaveArrayBufferToFloat32Arrays(new Int16Array([0, 32767, -32768, 0]).buffer, 1);

  expect(actual.map(channel => [...channel])).toEqual([[0, 32767 / 32768, -1, 0]]);
});

test('2 channels', () => {
  const actual = pcmWaveArrayBufferToFloat32Arrays(new Int16Array([0, 32767, -32768, 0]).buffer, 2);

  expect(actual.map(channel => [...channel])).toEqual([
    [0, -1],
    [32767 / 32768, 0]
  ]);
});

test('0 channels should throw', () => {
  expect(() => pcmWaveArrayBufferToFloat32Arrays(new Int16Array([0, 32767, -32768, 0]).buffer, 0));
});

test('non-divisible channels should throw', () => {
  expect(() => pcmWaveArrayBufferToFloat32Arrays(new Int16Array([0, 32767, -32768]).buffer, 2));
});
