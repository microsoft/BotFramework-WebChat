/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('race conditions between first bot activity and first user activity should not cause any delay to the first bot activity', () =>
    runHTMLTest('accessibility.delayActivity.raceCondition.html'));
});
