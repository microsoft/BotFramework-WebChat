/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

// sah - suggested actions height
// tw - textWrap
// mh - maxHeight

test('when false, should ignore maxHeight.', () =>
  runHTML('suggestedActions.stacked.buttonTextWrap.html#sah=40&tw=false&mh=80'));

test('when true & maxHeight is 20 & height is default, maxHeight will override height', () =>
  runHTML('suggestedActions.stacked.buttonTextWrap.html#tw=true&mh=20'));

test('when true & maxHeight is 30, change min height.', () =>
  runHTML('suggestedActions.stacked.buttonTextWrap.html#sah=40&tw=true&mh=30'));

test('when true & maxHeight is 45, change maxHeight.', () =>
  runHTML('suggestedActions.stacked.buttonTextWrap.html#sah=40&tw=true&mh=45'));

test('when true & maxHeight is 80, change maxHeight to fit text.', () =>
  runHTML('suggestedActions.stacked.buttonTextWrap.html#sah=40&tw=true&mh=80'));

test('when true & maxHeight is 100% & suggested action height is 60, height will be 60', () =>
  runHTML('suggestedActions.stacked.buttonTextWrap.html#sah=60&tw=true&mh=100%25'));

test('when true & maxHeight is 100%, change maxHeight to fit text.', () =>
  runHTML('suggestedActions.stacked.buttonTextWrap.html#sah=20&tw=true&mh=100%25'));

test('when true & maxHeight is undefined, should default maxHeight to 100%25', () =>
  runHTML('suggestedActions.stacked.buttonTextWrap.html#sah=40&tw=true'));
