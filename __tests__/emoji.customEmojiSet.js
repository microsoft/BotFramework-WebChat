import { Key } from 'selenium-webdriver';

import { timeouts } from './constants.json';
import getSendBoxTextBox from './setup/elements/getSendBoxTextBox.js';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('Emoji', () => {
  let driver;

  async function expectTextBox(value, selectionStart, selectionEnd) {
    const textBox = await getSendBoxTextBox(driver);

    // To improve test reliability, we will wait up to 500 ms for the expectation.
    const getActual = () =>
      driver.executeScript(
        ({ selectionEnd, selectionStart, value }) => ({ selectionEnd, selectionStart, value }),
        textBox
      );

    await driver
      .wait(async () => {
        const actual = await getActual();

        return (
          actual.selectionEnd === selectionEnd && actual.selectionStart == selectionStart && actual.value === value
        );
      }, timeouts.ui)
      .catch(() => {});

    const resultTask = getActual();

    await expect(resultTask).resolves.toHaveProperty('value', value);
    await expect(resultTask).resolves.toHaveProperty('selectionStart', selectionStart);
    await expect(resultTask).resolves.toHaveProperty('selectionEnd', selectionEnd);
  }

  function sendKeyChord(modifier, key) {
    return driver.actions().keyDown(modifier).sendKeys(key).keyUp(modifier).perform();
  }

  function sendControlKey(key) {
    return sendKeyChord(Key.CONTROL, key);
  }

  function sendUndoKey() {
    return sendControlKey('z');
  }

  test('disabled', async () => {
    driver = (await setupWebDriver({ props: { styleOptions: { emojiSet: false } } })).driver;

    const textBox = await getSendBoxTextBox(driver);

    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys(':)').perform();

    await expectTextBox(':)', 2, 2);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('with only "100" is enabled', async () => {
    driver = (await setupWebDriver({ props: { styleOptions: { emojiSet: { '100': '💯' } } } })).driver;

    const textBox = await getSendBoxTextBox(driver);

    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys(':) 100 :)').perform();

    await expectTextBox(':) 💯 :)', 8, 8);
  });

  test('with conflicting emoticon 1', async () => {
    driver = (await setupWebDriver({ props: { styleOptions: { emojiSet: { ':o': '😲', ':o)': '🤡' } } } })).driver;

    const textBox = await getSendBoxTextBox(driver);

    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys(':o)').perform();

    await expectTextBox('😲)', 3, 3);
  });

  test('with conflicting emoticon 2', async () => {
    driver = (await setupWebDriver({ props: { styleOptions: { emojiSet: { ':o)': '🤡', ':o': '😲' } } } })).driver;

    const textBox = await getSendBoxTextBox(driver);

    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys(':o)').perform();

    await expectTextBox('😲)', 3, 3);
  });
});
