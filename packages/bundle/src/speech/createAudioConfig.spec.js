/* eslint no-empty-function: "off" */

import createAudioConfig from './createAudioConfig';

describe('Verify arguments', () => {
  test('should not throw if only "attach" is supplied', () => {
    expect(() => createAudioConfig({ attach: () => {} })).not.toThrow();
  });

  test('should not throw if both "attach" and "turnOff" are supplied', () => {
    expect(() => createAudioConfig({ attach: () => {}, turnOff: () => {} })).not.toThrow();
  });

  test('should throw if "attach" is not supplied', () => {
    expect(() => createAudioConfig({})).toThrow('"attach" must be a function.');
  });

  test('should throw if "turnOff" is not a function', () => {
    expect(() => createAudioConfig({ attach: () => {}, turnOff: '123' })).toThrow(
      '"turnOff", if defined, must be a function.'
    );
  });
});
