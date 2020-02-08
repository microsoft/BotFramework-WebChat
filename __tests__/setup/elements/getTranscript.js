import { By } from 'selenium-webdriver';

export default async function getTranscript(driver) {
  return await driver.findElement(By.css('[role="log"]:not(.webchat__toaster)'));
}
