import { parseUIState } from './uiState';

describe.each([
  ['blueprint', false, 'blueprint'],
  ['blueprint', true, 'blueprint'],
  ['blueprint', undefined, 'blueprint'],
  ['disabled', false, 'disabled'],
  ['disabled', true, 'disabled'],
  ['disabled', undefined, 'disabled'],
  ['xyz', false, undefined],
  ['xyz', true, 'disabled'],
  ['xyz', undefined, undefined],
  [undefined, false, undefined],
  [undefined, true, 'disabled'],
  [undefined, undefined, undefined]
])('uiState=%s and disabled=%s', (uiState, disabled, expected) => {
  describe('parseUIState', () => {
    test(`should return ${JSON.stringify(expected)}`, () =>
      expect(parseUIState(uiState as any, disabled as any)).toBe(expected));
  });
});
