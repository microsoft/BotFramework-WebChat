import { By } from 'selenium-webdriver';

export default async function getNumActivitiesShown(driver) {
  return (await driver.findElements(By.css(`[role="listitem"]`))).length;
}
