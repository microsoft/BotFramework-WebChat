/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('createStyleSets in ES5 bundle should add Adaptive Card style sets', () => runHTML('styleOptions.createAdaptiveCardsStyleSet.html'));
