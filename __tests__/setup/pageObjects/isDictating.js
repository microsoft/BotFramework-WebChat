import { By } from 'selenium-webdriver';

export default async function isDictating(driver) {
  const microphoneButtonContainer = await driver.findElement(
    By.css('[aria-controls="webchatSendBoxMicrophoneButton"]')
  );
  const microphoneButtonClassName = await microphoneButtonContainer.getAttribute('class');

  return microphoneButtonClassName.split(' ').includes('dictating');
}
