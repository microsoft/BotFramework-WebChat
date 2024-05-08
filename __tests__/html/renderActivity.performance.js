/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Batched renderer', () => {
  test('does not produce unnecessary rerenders', () => runHTML('renderActivity.performance'));
});
