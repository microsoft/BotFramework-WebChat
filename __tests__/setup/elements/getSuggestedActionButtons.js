import { By } from 'selenium-webdriver';

export default async function getSuggestedActionButtons(driver) {
  return await driver.findElements(By.css('[role="form"] > :nth-child(2) ul > li button'));
}
