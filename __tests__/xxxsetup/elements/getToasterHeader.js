import { By } from 'selenium-webdriver';

export default async function getToasterHeader(driver) {
  return await driver.findElement(By.css('.webchat__toaster__header'));
}
