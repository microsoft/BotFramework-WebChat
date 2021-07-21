/** @jest-environment jsdom */

import pcmWaveArrayBufferToRiffWaveArrayBuffer from './pcmWaveArrayBufferToRiffWaveArrayBuffer';

beforeAll(() => {
  // When running under JSDOM, the ArrayBuffer and Uint8Array.buffer doesn't match.
  // This code is to pair them up.
  global.ArrayBuffer = new Uint8Array().buffer.constructor;
});

test('throw if not ArrayBuffer', () => {
  expect(() => pcmWaveArrayBufferToRiffWaveArrayBuffer(new Int16Array())).toThrow();
});

test('simple', () => {
  const actual = pcmWaveArrayBufferToRiffWaveArrayBuffer(new Int16Array([0, 32767, -32768, 0]).buffer);

  // The following content is verified down to every byte. It is the content of a RIFF WAVE file.
  expect([...new Uint8Array(actual)]).toMatchInlineSnapshot(`
    Array [
      82,
      73,
      70,
      70,
      44,
      0,
      0,
      0,
      87,
      65,
      86,
      69,
      102,
      109,
      116,
      32,
      16,
      0,
      0,
      0,
      1,
      0,
      1,
      0,
      128,
      62,
      0,
      0,
      0,
      125,
      0,
      0,
      2,
      0,
      16,
      0,
      100,
      97,
      116,
      97,
      8,
      0,
      0,
      0,
      0,
      0,
      255,
      127,
      0,
      128,
      0,
      0,
    ]
  `);
});
