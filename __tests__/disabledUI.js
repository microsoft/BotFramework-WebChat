import { imageSnapshotOptions, timeouts } from './constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('tests the UI of disabled Web Chat', () => {
  test('change default disabled button color', async () => {
    const styleOptions = { sendBoxTextWrap: true, sendBoxButtonColorOnDisabled: 'blue' };
    const disabled = true;

    const { driver } = await setupWebDriver({ props: { styleOptions, disabled } });

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
