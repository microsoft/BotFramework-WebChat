import { Key } from 'selenium-webdriver';

import { timeouts } from '../../constants.json';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import getSendBoxTextBox from './getSendBoxTextBox';

export default async function sendMessageViaSendBox(driver, text, { waitForSend = true } = {}) {
  const input = await getSendBoxTextBox(driver);

  await input.sendKeys(text, Key.RETURN);

  waitForSend && (await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
