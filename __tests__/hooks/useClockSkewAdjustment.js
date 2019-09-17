import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return clock skew adjustment', async () => {
  const { pageObjects } = await setupWebDriver();

  await pageObjects.dispatchAction({
    payload: { value: 864000000 },
    type: 'WEB_CHAT/SET_CLOCK_SKEW_ADJUSTMENT'
  });

  const [clockSkewAdjustment] = await pageObjects.runHook('useClockSkewAdjustment');

  expect(clockSkewAdjustment).toBe(864000000);
});

test('setter should throw exception', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(
    pageObjects.runHook('useClockSkewAdjustment', [], clockSkewAdjustment => clockSkewAdjustment[1]())
  ).rejects.toThrow();
});
