/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('Activity container should have role="list", and message container role="listitem"', () =>
    runHTMLTest('accessibility.activity.stackedLayoutRole'));
});
