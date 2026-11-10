/**
 * @jest-environment @happy-dom/jest-environment
 */
// Which error messages the goldens keep: only the engine's own wordings are replaced.
import encodeGolden, { describeError, takeEngineMessages } from './encodeGolden';

afterEach(() => {
  takeEngineMessages();
});

test('a TypeError of Web Chat keeps its message', () => {
  expect(encodeGolden(new TypeError('Cannot modify a readonly Map'))).toEqual({
    '[TypeError]': 'Cannot modify a readonly Map'
  });
  expect(describeError(new TypeError('listener must be a function'))).toBe('TypeError(listener must be a function)');
  expect(takeEngineMessages()).toEqual([]);
});

test('a TypeError of the engine is recorded without its message', () => {
  const directLine: any = {};
  const errors = [() => directLine.end(), () => directLine.activity.type].map(fn => {
    try {
      fn();
    } catch (error) {
      return error;
    }
  });

  expect(encodeGolden(errors)).toEqual([{ '[TypeError]': '[engine message]' }, { '[TypeError]': '[engine message]' }]);
  // The original messages, for the diagnosis (their wording is the engine's).
  expect(takeEngineMessages()).toHaveLength(2);

  // V8's wording when the machines (untranspiled) destructure null; built by hand, as this spec is transpiled.
  expect(encodeGolden(new TypeError("Cannot destructure property 'connectionStatus' of '{}' as it is null."))).toEqual({
    '[TypeError]': '[engine message]'
  });
});

test('a value of an unknown type throws', () => {
  expect(() => encodeGolden({ map: new Map() })).toThrow('encodeGolden: cannot encode an instance of Map');
  expect(() => encodeGolden([BigInt(1)])).toThrow('encodeGolden: cannot encode a bigint');
});
