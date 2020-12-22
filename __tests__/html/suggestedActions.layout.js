/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('suggested actions', () => {
  describe.each([
    ['left-to-right', undefined],
    ['right-to-left', 'rtl']
  ])('in %s', (_, dir) => {
    describe.each([
      ['carousel layout', 'carousel'],
      ['flow layout', 'flow'],
      ['flow layout with maxHeight', 'flow-maxheight'],
      ['stacked layout', 'stacked'],
      ['stacked layout with height', 'stacked-maxheight']
    ])('using %s', (_, preset) => {
      test('should be correct', async () => {
        const hashParams = new URLSearchParams({ preset });

        dir && hashParams.set('dir', dir);

        await runHTMLTest(`suggestedActions.layout#${hashParams}`);
      });
    });
  });
});
