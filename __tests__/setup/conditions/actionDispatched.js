import { Condition } from 'selenium-webdriver';

export default function actionDispatched(predicateOrType) {
  const message =
    typeof predicateOrType === 'string' ? `action "${predicateOrType}" to dispatch` : 'action to dispatch';

  if (typeof predicateOrType === 'string') {
    const expectedType = predicateOrType;

    predicateOrType = ({ type }) => type === expectedType;
  }

  return new Condition(message, async driver => {
    const actions = await driver.executeScript(() =>
      JSON.parse(
        JSON.stringify(
          window.WebChatTest.actions.map(action => {
            // Filter out payload on DIRECT_LINE/* because some content is not stringifiable

            if (/^DIRECT_LINE\//.test(action.type) && action.payload && action.payload.directLine) {
              return simpleUpdateIn(action, ['payload', 'directLine'], () => ({}));
            }

            return action;
          })
        )
      )
    );

    return ~actions.findIndex(action => predicateOrType(action));
  });
}
