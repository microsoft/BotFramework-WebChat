/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('upload a file in Polish', () => {
  test('should render properly', () =>
    runHTML('localization.fileUpload.polish.html'));
});
