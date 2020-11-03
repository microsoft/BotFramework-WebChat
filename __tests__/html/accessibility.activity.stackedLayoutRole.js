/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('Activity container should have role="group", and message container role="group"', () =>
    runHTMLTest('accessibility.activity.stackedLayoutRole'));
});
