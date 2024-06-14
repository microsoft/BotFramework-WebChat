/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  describe('WebChat as custom element', () => {
    test('inside shadowRoot', () => runHTML('fluentTheme/customElement/shadowRoot'));
  });
});
