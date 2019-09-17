import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should get styleOptions from props', async () => {
  const { pageObjects } = await setupWebDriver({ props: { styleOptions: { backgroundColor: 'Red' } } });

  await expect(pageObjects.runHook('useStyleOptions', [], result => result[0])).resolves.toHaveProperty(
    'backgroundColor',
    'Red'
  );
});

test('setter should throw exception', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useStyleOptions', [], result => result[1]())).rejects.toThrow();
});
