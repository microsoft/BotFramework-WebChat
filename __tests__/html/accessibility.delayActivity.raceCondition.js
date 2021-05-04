/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('race conditions between first bot activity and first user activity should not cause any delay to the first bot activity', () =>
    runHTML('accessibility.delayActivity.raceCondition.html'));
});
