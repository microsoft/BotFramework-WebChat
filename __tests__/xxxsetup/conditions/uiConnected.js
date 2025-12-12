import { Condition } from 'selenium-webdriver';
import directLineConnected from './directLineConnected';

export default function uiConnected() {
  return new Condition('for UI to connect', async driver => {
    const connected = await driver.wait(directLineConnected(), 5000);

    if (connected) {
      await driver.sleep(500);
    }

    return connected;
  });
}
