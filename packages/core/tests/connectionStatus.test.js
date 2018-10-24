import createFacility from './createFacility';

import { START_CONNECTION } from '../src/actions/startConnection';

test('Connection status', async () => {
  const { directLine, store } = await createFacility({ start: false });

  expect(store.getState()).toHaveProperty('connection.readyState', 0);

  store.dispatch({
    type: START_CONNECTION,
    payload: {
      directLine,
      userID: 'default-user'
    }
  });

  directLine.connectionStatus.next(1);
  await 0;

  expect(store.getState()).toHaveProperty('connection.readyState', 1);
});
