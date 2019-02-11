import { Condition } from 'selenium-webdriver';

export default function () {
  return new Condition('all outgoing activities to be sent', async driver => {
    return await driver.executeScript(() => {
      const { store } = window.WebChatTest;
      const { activities } = store.getState();

      return activities.filter(({ from: { role } }) => role === 'user').every(({ channelData: { state } }) => state === 'sent');
    });
  });
}
