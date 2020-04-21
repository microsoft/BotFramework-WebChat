/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('hero card actions', () => {
  test('imBack', () => runHTMLTest('heroCard.actions.html#btn=1&exp=4'));
  test('postBack (string)', () => runHTMLTest('heroCard.actions.html#btn=2&exp=3'));
  test('postBack (JSON)', () => runHTMLTest('heroCard.actions.html#btn=3&exp=3'));
  test('messageBack (displayText + text + value)', () => runHTMLTest('heroCard.actions.html#btn=4&exp=4'));
  test('messageBack (displayText + text)', () => runHTMLTest('heroCard.actions.html#btn=5&exp=4'));
  test('messageBack (value)', () => runHTMLTest('heroCard.actions.html#btn=6&exp=3'));
  test('postBack (empty)', () => runHTMLTest('heroCard.actions.html#btn=7&exp=3'));
  test('messageBack (empty)', () => runHTMLTest('heroCard.actions.html#btn=8&exp=3'));
});
