import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return Adaptive Cards package set in props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      adaptiveCardsPackage: {
        __DUMMY__: 0
      }
    }
  });

  const [adaptiveCardsPackage] = await pageObjects.runHook('useAdaptiveCardsPackage');

  expect(adaptiveCardsPackage).toMatchInlineSnapshot(`
    Object {
      "__DUMMY__": 0,
    }
  `);
});

test('getter should return default Adaptive Cards package if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  const [adaptiveCardsPackage] = await pageObjects.runHook('useAdaptiveCardsPackage', [], results =>
    new results[0].Version().major.toString()
  );

  expect(adaptiveCardsPackage).toMatchInlineSnapshot(`"1"`);
});

test('setter should be undefined', async () => {
  const { pageObjects } = await setupWebDriver();
  const setAdaptiveCardsPackage = await pageObjects.runHook(
    'useAdaptiveCardsPackage',
    [],
    results => typeof results[1] === 'undefined'
  );

  expect(setAdaptiveCardsPackage).toMatchInlineSnapshot(`true`);
});
