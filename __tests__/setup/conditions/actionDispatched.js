import { Condition } from 'selenium-webdriver';

export default function actionDispatched(predicateOrType) {
  if (typeof predicateOrType === 'string') {
    const expectedType = predicateOrType;

    predicateOrType = ({ type }) => type === expectedType;
  }

  return new Condition('Action to dispatch', async driver => {
    const actions = await driver.executeScript(() =>
      JSON.parse(
        JSON.stringify(
          window.WebChatTest.actions.map(action => {
            // Filter out payload on DIRECT_LINE/CONNECT* because the content is not stringifiable

            if (/^DIRECT_LINE\/CONNECT/.test(action.type)) {
              action.payload.directLine = {};
            }

            return action;
          })
        )
      )
    );

    return ~actions.findIndex(action => predicateOrType(action));
  });
}
