import { Key } from 'selenium-webdriver';

import { timeouts } from '../../constants.json';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import typeOnSendBox from './typeOnSendBox';

export default async function sendMessageViaSendBox(driver, text, { waitForSend = true } = {}) {
  await typeOnSendBox(driver, text, Key.RETURN);

  waitForSend && (await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
