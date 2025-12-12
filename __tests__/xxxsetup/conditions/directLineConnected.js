import { Condition } from 'selenium-webdriver';

export default function directLineConnected() {
  return new Condition(
    'Direct Line to connect',
    async driver =>
      await driver.executeScript(
        () => ~window.WebChatTest.actions.findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_FULFILLED')
      )
  );
}
