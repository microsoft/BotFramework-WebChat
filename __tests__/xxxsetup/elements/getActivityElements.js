import { By } from 'selenium-webdriver';

export default async function getActivityElements(driver) {
  return await driver.findElements(By.css(`.webchat__basic-transcript__activity`));
}
