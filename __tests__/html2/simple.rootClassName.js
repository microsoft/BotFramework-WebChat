/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('simple', () => {
  test('should apply "className" prop.', () => runHTML('simple.rootClassName.html'));
});
