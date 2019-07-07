import { By } from 'selenium-webdriver';

export default async function sendMessageViaSendBox(driver, text, { waitForSend = true }) {
  const microphoneButton = await driver.findElement(
    By.css('[aria-controls="webchatSendBoxMicrophoneButton"] > button')
  );

  await microphoneButton.click();
}
