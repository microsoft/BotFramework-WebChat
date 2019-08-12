import { By } from 'selenium-webdriver';

export default async function getMicrophoneButton(driver) {
  return await driver.findElement(By.css('[aria-controls="webchatSendBoxMicrophoneButton"] > button'));
}
