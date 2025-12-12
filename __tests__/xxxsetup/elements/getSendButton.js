import { By } from 'selenium-webdriver';

export default async function getSendButton(driver) {
  return await driver.findElement(By.css('[role="form"] button[title="Send"]'));
}
