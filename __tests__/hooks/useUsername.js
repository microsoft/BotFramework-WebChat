import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return username set in props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      username: 'u-12345'
    }
  });

  const [username] = await pageObjects.runHook('useUsername');

  expect(username).toMatchInlineSnapshot(`"u-12345"`);
});

test('getter should return undefined if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  const [username] = await pageObjects.runHook('useUsername');

  expect(username).toMatchInlineSnapshot(`"Happy Web Chat user"`);
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setUsername] = await pageObjects.runHook('useUsername');

  expect(setUsername).toBeFalsy();
});
