import { Key } from 'selenium-webdriver';

import { timeouts } from './constants.json';
import getSendBoxTextBox from './setup/elements/getSendBoxTextBox.js';
import getTranscript from './setup/elements/getTranscript.js';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('Emoji', () => {
  let driver, textBox, transcript;

  beforeEach(async () => {
    driver = (await setupWebDriver()).driver;

    textBox = await getSendBoxTextBox(driver);
    transcript = await getTranscript(driver);
  });

  async function expectTextBox(value, selectionStart, selectionEnd) {
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

  test('Sequence 0', async () => {
    await transcript.click();

    await driver.actions().sendKeys('abc').perform();

    await expectTextBox('abc', 3, 3);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 1', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc', Key.ARROW_LEFT, Key.ARROW_LEFT, '123').perform();
    await sendUndoKey();

    await expectTextBox('abc', 1, 1);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 2', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc').perform();
    await driver.executeScript(textBox => textBox.blur(), textBox);
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.executeScript(textBox => textBox.blur(), textBox);
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 3', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('ab', Key.ARROW_LEFT, ':-)').perform();

    await expectTextBox('a😊b', 3, 3);

    await sendUndoKey();

    await expectTextBox('a:-)b', 4, 4);

    await sendUndoKey();

    await expectTextBox('ab', 1, 1);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 4', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc', Key.ARROW_LEFT, Key.BACK_SPACE).perform();
    await sendUndoKey();

    await expectTextBox('abc', 2, 2);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 5', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);

    await driver.actions().sendKeys('abc').perform();
    await driver
      .actions()
      .sendKeys(Key.ARROW_LEFT)
      .keyDown(Key.SHIFT)
      .sendKeys(Key.ARROW_LEFT)
      .keyUp(Key.SHIFT)
      .sendKeys('d')
      .perform();

    await expectTextBox('adc', 2, 2);

    await sendUndoKey();

    await expectTextBox('abc', 1, 2);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 6', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);

    await driver.actions().sendKeys('abc').perform();

    await driver.executeScript(textBox => textBox.blur(), textBox);
    await driver.executeScript(textBox => textBox.focus(), textBox);

    await driver
      .actions()
      .sendKeys(Key.ARROW_LEFT)
      .keyDown(Key.SHIFT)
      .sendKeys(Key.ARROW_LEFT)
      .keyUp(Key.SHIFT)
      .sendKeys('d')
      .perform();

    await expectTextBox('adc', 2, 2);

    await sendUndoKey();

    await expectTextBox('abc', 1, 2);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 7', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc:)').perform();

    await expectTextBox('abc😊', 5, 5);

    await driver.actions().sendKeys('xyz').perform();

    await expectTextBox('abc😊xyz', 8, 8);

    await sendUndoKey();

    await expectTextBox('abc😊', 5, 5);

    await sendUndoKey();

    await expectTextBox('abc:)', 5, 5);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 8', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc').perform();
    await driver.executeScript(textBox => textBox.blur(), textBox);
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await sendControlKey('a');
    await driver.actions().sendKeys(Key.BACK_SPACE, 'def').perform();
    await sendUndoKey();

    await expectTextBox('abc', 0, 3);
  });

  test('Sequence 9', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc').perform();
    await driver.executeScript(textBox => textBox.blur(), textBox);
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await sendControlKey('a');
    await driver.actions().sendKeys('def').perform();
    await sendUndoKey();

    await expectTextBox('abc', 0, 3);
  });

  test('Sequence 10', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc:)').perform();
    await sendUndoKey();

    await expectTextBox('abc:)', 5, 5);

    await sendControlKey('axv');

    await expectTextBox('abc:)', 5, 5);
  });

  test('Sequence 11', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc:)').perform();

    await expectTextBox('abc😊', 5, 5);

    await sendUndoKey();
    await driver.actions().sendKeys('123').perform();

    await expectTextBox('abc:)123', 8, 8);

    await sendControlKey('axv');

    await expectTextBox('abc:)123', 8, 8);
  });

  test('Sequence 12', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc:)').perform();

    await expectTextBox('abc😊', 5, 5);

    await sendUndoKey();

    await expectTextBox('abc:)', 5, 5);

    await driver.actions().sendKeys('123').perform();

    await expectTextBox('abc:)123', 8, 8);

    await driver.actions().sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE).perform();

    await expectTextBox('abc:)', 5, 5);
  });

  test('Sequence 13', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc:)').perform();
    await sendUndoKey();
    await driver.actions().sendKeys('1').perform();

    await expectTextBox('abc:)1', 6, 6);

    await driver.actions().sendKeys(Key.ARROW_LEFT, Key.DELETE).perform();

    await expectTextBox('abc:)', 5, 5);
  });

  test('Sequence 14', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc').perform();
    await sendControlKey('a');
    await driver.actions().sendKeys(Key.BACK_SPACE).perform();
    await driver.actions().sendKeys('123:)').perform();

    await expectTextBox('123😊', 5, 5);

    await sendUndoKey();

    await expectTextBox('123:)', 5, 5);

    await sendUndoKey();

    await expectTextBox('abc', 0, 3);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 15', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc').perform();
    await sendControlKey('a');
    await driver.actions().sendKeys(Key.BACK_SPACE).perform();

    await expectTextBox('', 0, 0);

    await sendUndoKey();

    await expectTextBox('abc', 0, 3);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 16', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys(':').perform();
    await sendControlKey('ax');
    await driver.actions().sendKeys('abc)', Key.ARROW_LEFT).perform();
    await sendControlKey('v');

    await expectTextBox('abc:)', 4, 4);

    await sendUndoKey();

    await expectTextBox('abc)', 3, 3);

    await sendUndoKey();

    await expectTextBox(':', 0, 1);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  // Currently, this test do not reflect what the real browser would behave due to technical limitation.
  test('Sequence 17', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('-)').perform();
    await sendControlKey('ax');
    await driver.actions().sendKeys('abc:').perform();
    await sendControlKey('v');

    await expectTextBox('abc:-)', 6, 6);

    await sendUndoKey();

    // In a real browser, it will undo to "abc:", because paste will generate a new checkpoint.
    // But since we can't know if the text is being pasted or not, we can't generate a new checkpoint to undo to "abc:".
    // Thus, it will directly undo to "-)" now.
    await expectTextBox('-)', 0, 2);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 18', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc:1)', Key.ARROW_LEFT, Key.BACK_SPACE).perform();

    await expectTextBox('abc:)', 4, 4);

    await sendUndoKey();

    await expectTextBox('abc:1)', 5, 5);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  // Currently, this test do not reflect what the real browser would behave due to technical limitation.
  test('Sequence 19', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc').perform();

    // Cut and paste will generate a new checkpoint.
    // But since we can't know if the text is being pasted or not, we can't generate a new checkpoint to undo to "abc:".
    await sendControlKey('ax');
    await driver.actions().sendKeys('def').perform();
    await sendUndoKey();

    // Since we will not generate a checkpoint, we will directly revert to "abc".
    await expectTextBox('abc', 0, 3);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 20', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc').perform();

    await sendControlKey('a');
    // Unlike test 19, backspace will not generate a new checkpoint.
    await driver.actions().sendKeys(Key.BACK_SPACE, 'def').perform();
    await sendUndoKey();

    await expectTextBox('abc', 0, 3);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 21', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys(')').perform();
    await sendControlKey('ax');
    await driver.actions().sendKeys('abc:def', Key.ARROW_LEFT, Key.ARROW_LEFT).perform();
    await sendKeyChord(Key.SHIFT, Key.ARROW_LEFT);

    await sendControlKey('v');

    await expectTextBox('abc:)ef', 5, 5);

    await sendUndoKey();

    await expectTextBox('abc:def', 4, 5);

    await sendUndoKey();

    await expectTextBox(')', 0, 1);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 22', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc:)').perform();
    await expectTextBox('abc😊', 5, 5);

    await sendUndoKey();

    await expectTextBox('abc:)', 5, 5);

    await driver.actions().sendKeys(':)').perform();

    await expectTextBox('abc:)😊', 7, 7);

    await sendUndoKey();

    await expectTextBox('abc:):)', 7, 7);

    await sendUndoKey();

    await expectTextBox('abc:)', 5, 5);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 23', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc', Key.ARROW_LEFT, ')', Key.ARROW_LEFT, ':)').perform();
    await expectTextBox('ab😊)c', 4, 4);

    await sendUndoKey();

    await expectTextBox('ab:))c', 4, 4);

    await sendUndoKey();

    await expectTextBox('ab)c', 2, 2);

    await sendUndoKey();

    await expectTextBox('abc', 2, 2);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });

  test('Sequence 24', async () => {
    await driver.executeScript(textBox => textBox.focus(), textBox);
    await driver.actions().sendKeys('abc', Key.ARROW_LEFT, ')', Key.ARROW_LEFT, ':)').perform();
    await expectTextBox('ab😊)c', 4, 4);

    await sendUndoKey();

    await expectTextBox('ab:))c', 4, 4);

    await driver.actions().sendKeys(Key.ARROW_RIGHT, Key.BACK_SPACE).perform();

    await expectTextBox('ab:)c', 4, 4);

    await sendUndoKey();

    await expectTextBox('ab:))c', 5, 5);

    await sendUndoKey();

    await expectTextBox('ab)c', 2, 2);

    await sendUndoKey();

    await expectTextBox('abc', 2, 2);

    await sendUndoKey();

    await expectTextBox('', 0, 0);
  });
});
