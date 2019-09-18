import { By, Condition } from 'selenium-webdriver';

import getSendBoxTextBox, { CSS_SELECTOR } from '../elements/getSendBoxTextBox';
import hasElement from './hasElement';

export default function sendBoxTextBoxFocused() {
  return new Condition('Send box text box to be focused', async driver => {
    // Make sure the send box text box is visible
    await getSendBoxTextBox(driver);

    return await hasElement(By.css(CSS_SELECTOR + ':focus')).fn(driver);
  });
}
