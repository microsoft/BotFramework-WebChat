import { By } from 'selenium-webdriver';

export default async function getScrollToBottomButton(driver) {
  return await driver.findElement(By.css('[role="log"] > button:last-child'));
}
