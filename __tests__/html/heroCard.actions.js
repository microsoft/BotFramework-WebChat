/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('hero card actions', () => {
  test('imBack', () => runHTML('heroCard.actions.html#btn=1&exp=4'));
  test('postBack (string)', () => runHTML('heroCard.actions.html#btn=2&exp=3'));
  test('postBack (JSON)', () => runHTML('heroCard.actions.html#btn=3&exp=3'));
  test('messageBack (displayText + text + value)', () => runHTML('heroCard.actions.html#btn=4&exp=4'));
  test('messageBack (displayText + text)', () => runHTML('heroCard.actions.html#btn=5&exp=4'));
  test('messageBack (value)', () => runHTML('heroCard.actions.html#btn=6&exp=3'));
  test('postBack (empty)', () => runHTML('heroCard.actions.html#btn=7&exp=3'));
  test('messageBack (empty)', () => runHTML('heroCard.actions.html#btn=8&exp=3'));
});
