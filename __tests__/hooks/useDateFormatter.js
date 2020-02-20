import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('should return relative date for "en"', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'en'
    }
  });

  const actual = await pageObjects.runHook('useDateFormatter', [], formatDate =>
    formatDate('2000-12-23T12:34:56.789Z')
  );

  expect(actual).toMatchInlineSnapshot(`"December 23 at 12:34 PM"`);
});

test('should return relative date for "yue"', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'yue'
    }
  });

  const actual = await pageObjects.runHook('useDateFormatter', [], formatDate =>
    formatDate('2000-12-23T12:34:56.789Z')
  );

  expect(actual).toMatchInlineSnapshot(`"12月23日 下午12:34"`);
});
