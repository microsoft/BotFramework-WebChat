import { Condition } from 'selenium-webdriver';

export default function () {
  return new Condition('Waiting for Direct Line to connect with a welcome message', async driver =>
    await driver.executeScript(() =>
      !!~window.WebChatTest.actions.findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_FULFILLED')
      && !!document.querySelector(`[role="listitem"]:nth-child(1)`)
    )
  );
}
