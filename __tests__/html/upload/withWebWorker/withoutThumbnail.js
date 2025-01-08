/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('with Web Worker upload a picture without thumbnail', () => {
  test('should send', () => runHTML('upload/withWebWorker/withoutThumbnail'));
});
