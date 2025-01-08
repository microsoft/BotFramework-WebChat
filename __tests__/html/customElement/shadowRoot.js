/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('WebChat as custom element', () => {
  test('inside shadowRoot', () => runHTML('customElement/shadowRoot'));
});
