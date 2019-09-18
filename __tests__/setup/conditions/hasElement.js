import { Condition } from 'selenium-webdriver';

export default function hasElement(locator) {
  return new Condition('element is locateable', async driver => {
    try {
      await driver.findElement(locator);

      return true;
    } catch (err) {
      if (err.name === 'NoSuchElementError') {
        return false;
      }

      throw err;
    }
  });
}
