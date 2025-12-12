import { Condition } from 'selenium-webdriver';

import { timeouts } from '../../constants.json';
import directLineConnected from '../conditions/directLineConnected';
import dispatchAction from './dispatchAction';

async function waitForPong(driver, expectedValue) {
  return await driver.executeScript(
    expectedValue =>
      window.WebChatTest.store
        .getState()
        .activities.some(
          ({ name, type, value }) => name === 'webchat/pong' && type === 'event' && value === expectedValue
        ),
    expectedValue
  );
}

export default async function pingBot(driver) {
  const timestamp = Date.now();

  await driver.wait(directLineConnected(), timeouts.directLine);
  await dispatchAction(driver, { type: 'WEB_CHAT/SEND_EVENT', payload: { name: 'webchat/ping', value: timestamp } });
  await driver.wait(new Condition('bot to send pong', driver => waitForPong(driver, timestamp)), timeouts.directLine);
}
