import { By } from 'selenium-webdriver';

export default async function getTranscript(driver) {
  return await driver.findElement(By.css('.webchat__basic-transcript'));
}
