import { By } from 'selenium-webdriver';

const CSS_SELECTOR = '[role="form"] > * > form > input[type="text"]';

export default async function getSendBoxTextBox(driver) {
  return await driver.findElement(By.css(CSS_SELECTOR));
}

export { CSS_SELECTOR };
