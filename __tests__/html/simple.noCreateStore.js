/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('simple without createStore', () => {
  test('should render UI.', () => runHTML('simple.noCreateStore.html'));
});
