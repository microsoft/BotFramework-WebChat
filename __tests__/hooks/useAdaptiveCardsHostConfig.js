import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return Adaptive Cards host config set in props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      adaptiveCardsHostConfig: {
        supportsInteractivity: false
      }
    }
  });

  const [adaptiveCardsHostConfig] = await pageObjects.runHook('useAdaptiveCardsHostConfig');

  expect(adaptiveCardsHostConfig).toMatchInlineSnapshot(`
    Object {
      "supportsInteractivity": false,
    }
  `);
});

test('getter should return default Adaptive Cards host config if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  const [adaptiveCardsHostConfig] = await pageObjects.runHook('useAdaptiveCardsHostConfig');

  expect(adaptiveCardsHostConfig.supportsInteractivity).toMatchInlineSnapshot(`true`);
});

test('setter should be undefined', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setAdaptiveCardsHostConfig] = await pageObjects.runHook('useAdaptiveCardsHostConfig');

  expect(setAdaptiveCardsHostConfig).toBeUndefined();
});
