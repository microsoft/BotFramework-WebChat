import { By } from 'selenium-webdriver';

export default async function getTranscriptScrollable(driver) {
  return await driver.findElement(By.css('.webchat__basic-transcript__scrollable'));
}
