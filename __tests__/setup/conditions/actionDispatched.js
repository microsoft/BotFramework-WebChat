import { Condition } from 'selenium-webdriver';

export default function actionDispatched(type) {
  return new Condition(
    'Action to dispatch',
    async driver =>
      await driver.executeScript(
        type => ~window.WebChatTest.actions.findIndex(({ type: target }) => target === type),
        type
      )
  );
}
