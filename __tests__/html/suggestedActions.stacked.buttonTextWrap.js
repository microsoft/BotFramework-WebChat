/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

// sah - suggested actions height
// tw - text wrap
// mh - max height

describe('suggested actions stacked button text wrap,', () => {
  test('when false, should ignore max height.', () =>
    runHTMLTest('suggestedActions.stacked.buttonTextWrap.html#sah=40&tw=false&mh=80'));
  test('when true and max height is 20 and suggested action height is default, change max height, max height will override height', () =>
    runHTMLTest('suggestedActions.stacked.buttonTextWrap.html#tw=true&mh=20'));
  test('when true and max height is 30, change min height.', () =>
    runHTMLTest('suggestedActions.stacked.buttonTextWrap.html#sah=40&tw=true&mh=30'));
  test('when true and max height is 45, change max height.', () =>
    runHTMLTest('suggestedActions.stacked.buttonTextWrap.html#sah=40&tw=true&mh=45'));
  test('when true and max height is 80, change max height to fit text.', () =>
    runHTMLTest('suggestedActions.stacked.buttonTextWrap.html#sah=40&tw=true&mh=80'));
  test('when true and max height is 100% and suggested action height is 60, change max height, height will be 60', () =>
    runHTMLTest('suggestedActions.stacked.buttonTextWrap.html#sah=60&tw=true&mh=100%25'));
  test('when true and max height is 100%, change max height to fit text.', () =>
    runHTMLTest('suggestedActions.stacked.buttonTextWrap.html#sah=20&tw=true&mh=100%25'));
  test('when true and max height is undefined, should default max height to 100%25', () =>
    runHTMLTest('suggestedActions.stacked.buttonTextWrap.html#sah=40&tw=true'));
});
