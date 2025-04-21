import { By } from 'selenium-webdriver';
import { testIds } from 'botframework-webchat';

const CSS_SELECTOR = `[data-testid="send box text area"]`;

export default async function getSendBoxTextBox(driver) {
  return await driver.findElement(By.css(CSS_SELECTOR));
}

export { CSS_SELECTOR };
