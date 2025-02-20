/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Activity render performance', () => {
  test('render activity profiling', () => runHTML('renderActivity.profiling'));
});
