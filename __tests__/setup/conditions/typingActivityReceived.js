import { Condition } from 'selenium-webdriver';

export default function () {
  return new Condition('Waiting for incoming typing activity', async driver => {
    await driver.executeScript(() =>
      // TODO: [P2] We should use activities selector from core
      !!~window.WebChatTest.store.getState().activities.findIndex(({ type }) => type === 'typing')
    )
  );
}
