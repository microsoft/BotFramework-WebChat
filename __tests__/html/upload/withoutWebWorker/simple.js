/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('without Web Worker upload a picture without Web Worker', () => {
  test('should send', () => runHTML('upload/withoutWebWorker/simple'));
});
