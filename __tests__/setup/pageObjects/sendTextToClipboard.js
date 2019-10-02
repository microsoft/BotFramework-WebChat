import { Condition, Key } from 'selenium-webdriver';

import { timeouts } from '../../constants.json';

export default async function sendTextToClipboard(driver, text) {
  await driver.executeScript(text => {
    const clipboardTextBox = document.createElement('input');

    clipboardTextBox.setAttribute('id', 'clipboard');
    clipboardTextBox.setAttribute('input', 'type');
    clipboardTextBox.value = text;

    document.body.append(clipboardTextBox);

    clipboardTextBox.focus();
    clipboardTextBox.select();
  }, text);

  await driver
    .actions()
    .keyDown(Key.CONTROL)
    .sendKeys('x')
    .keyUp(Key.CONTROL)
    .perform();
  await driver.wait(
    new Condition('Clipboard to be copied', driver =>
      driver.executeScript(() => !document.querySelector('input#clipboard').value)
    ),
    timeouts.ui
  );

  await driver.executeScript(() => {
    document.querySelector('input#clipboard').remove();
  });
}
