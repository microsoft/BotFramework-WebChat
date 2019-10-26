import { Condition } from 'selenium-webdriver';

export default function actionDispatched(predicateOrType) {
  if (typeof predicateOrType === 'string') {
    const expectedType = predicateOrType;

    predicateOrType = ({ type }) => type === expectedType;
  }

  return new Condition('Action to dispatch', async driver => {
    const actions = await driver.executeScript(() => JSON.parse(JSON.stringify(window.WebChatTest.actions)));

    return ~actions.findIndex(action => predicateOrType(action));
  });
}
