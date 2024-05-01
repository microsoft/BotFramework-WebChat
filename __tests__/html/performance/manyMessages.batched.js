/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('time taken to render 200 activities at batch of 20', () => {
  test('should have similar performance for first half and second half', () =>
    runHTML('performnace/manyMessages.batched.html'));
});
