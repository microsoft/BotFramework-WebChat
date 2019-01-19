import { Condition } from 'selenium-webdriver';

export default function () {
  return new Condition('Waiting for Direct Line to connect', async driver => {
    return await driver.executeScript(() => ~window.WebChatTest.actions.findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_FULFILLED'));
  });
}
