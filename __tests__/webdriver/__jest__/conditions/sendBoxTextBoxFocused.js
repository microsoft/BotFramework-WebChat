import { By, Condition } from 'selenium-webdriver';

import getSendBoxTextBox, { CSS_SELECTOR } from '../elements/getSendBoxTextBox';

export default function sendBoxTextBoxFocused() {
  return new Condition('Send box text box to be focused', async driver => {
    // Make sure the send box text box is visible
    await getSendBoxTextBox(driver);

    try {
      await driver.findElement(By.css(CSS_SELECTOR + ':focus'));

      return true;
    } catch (err) {
      if (err.name === 'NoSuchElementError') {
        return false;
      }

      throw err;
    }
  });
}
