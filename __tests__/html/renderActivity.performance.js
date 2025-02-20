/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Activity render performance', () => {
  test('does not produce unnecessary rerenders', () => runHTML('renderActivity.performance'));
});
