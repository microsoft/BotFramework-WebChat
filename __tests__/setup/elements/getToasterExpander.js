import { By } from 'selenium-webdriver';

export default async function getToasterExpander(driver) {
  return await driver.findElement(By.css('.webchat__toaster__expander'));
}
