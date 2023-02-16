/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('In RTL', () =>
  describe('suggested actions', () => {
    test('should scroll when flipper buttons are clicked', () => runHTML('suggestedActions.scroll.rtl.html'));
  }));
