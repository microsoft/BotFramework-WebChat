import mockDirectLine from './mockDirectLine';

import { START_CONNECTION } from '../src/actions/startConnection';
import createStore from '../src/createStore';

const DEFAULT_USER_ID = 'default-user';

jest.mock('../src/util/getTimestamp', () => {
  let now = 946684800000; // '2000-01-01T00:00:00.000Z'

  return function () {
    now += 1000;

    return new Date(now).toISOString();
  };
});

jest.mock('../src/util/uniqueID', () => {
  let uniqueSeed = 0;

  const fn = function (length = 7) {
    uniqueSeed += 0.123;

    return uniqueSeed.toString(36).substr(2, length);
  };

  fn.reset = () => uniqueSeed = 0;

  return fn;
});

export default async function ({
  start = true
} = {}) {
  const actions = [];
  const directLine = mockDirectLine();
  const latestActions = {};
  const store = createStore(() => next => action => {
    actions.push(action);
    latestActions[action.type] = action;

    return next(action);
  });

  if (start) {
    store.dispatch({
      type: START_CONNECTION,
      payload: {
        directLine,
        userID: DEFAULT_USER_ID
      }
    });

    directLine.connectionStatus.next(1);
    await 0;
  }

  return {
    actions,
    directLine,
    latestActions,
    store
  };
}
