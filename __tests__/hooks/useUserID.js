import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return user ID set in props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      userID: 'u-12345'
    }
  });

  const [userID] = await pageObjects.runHook('useUserID');

  expect(userID).toMatchInlineSnapshot(`"u-12345"`);
});

test('getter should return empty string if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  const [userID] = await pageObjects.runHook('useUserID');

  expect(userID).toMatchInlineSnapshot(`""`);
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setUserID] = await pageObjects.runHook('useUserID');

  expect(setUserID).toBeFalsy();
});
