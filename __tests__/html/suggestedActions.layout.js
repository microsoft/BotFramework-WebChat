/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('suggested actions', () => {
  describe.each([
    ['left-to-right', undefined],
    ['right-to-left', 'rtl']
  ])('in %s', (_, dir) => {
    describe.each([
      ['carousel layout', 'carousel'],
      ['carousel layout with fewer items', 'carousel', { fewer: 1 }],
      ['flow layout', 'flow'],
      ['flow layout with maxHeight', 'flow-maxheight'],
      ['stacked layout', 'stacked'],
      ['stacked layout and disabled', 'stacked-disabled'],
      ['stacked layout with height', 'stacked-maxheight']
    ])('using %s', (_, preset, extraSearchParams) => {
      test('should be correct', async () => {
        const params = new URLSearchParams({ ...extraSearchParams, preset });

        dir && params.set('dir', dir);

        await runHTML(`suggestedActions.layout#${params}`);
      });
    });
  });
});
