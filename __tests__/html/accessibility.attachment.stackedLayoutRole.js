/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('Attachment container should have role="group", and message container role="group"', () =>
    runHTML('accessibility.attachment.stackedLayoutRole'));
});
