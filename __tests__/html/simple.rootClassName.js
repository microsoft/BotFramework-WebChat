/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('simple', () => {
  test('should apply "className" prop.', () => runHTML('simple.rootClassName.html'));
});
