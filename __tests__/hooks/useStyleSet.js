import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should get styleSet from props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: { styleSet: { options: {}, root: { backgroundColor: 'Red' } } }
  });

  const styleSet = await pageObjects.runHook('useStyleSet', [], result => result[0]);

  expect(styleSet).toHaveProperty('options', {});
  expect(styleSet).toHaveProperty('root', expect.stringMatching(/^webchat--css-\w{5}-1v40psm$/u));
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setStyleSet] = await pageObjects.runHook('useStyleSet');

  expect(setStyleSet).toBeFalsy();
});
