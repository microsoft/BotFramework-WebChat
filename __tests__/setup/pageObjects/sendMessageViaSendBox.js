import { Key } from 'selenium-webdriver';

import { timeouts } from '../../constants.json';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import setSendBoxText from './setSendBoxText';

export default async function sendMessageViaSendBox(driver, text, { waitForSend = true } = {}) {
  await setSendBoxText(driver, text, Key.RETURN);

  waitForSend && (await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
