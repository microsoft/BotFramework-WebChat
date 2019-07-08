import { By } from 'selenium-webdriver';

export default async function clickMicrophoneButton(driver) {
  const microphoneButton = await driver.findElement(
    By.css('[aria-controls="webchatSendBoxMicrophoneButton"] > button')
  );

  await microphoneButton.click();
}
