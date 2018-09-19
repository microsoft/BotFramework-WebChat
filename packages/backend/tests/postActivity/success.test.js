import createFacility from '../createFacility';

import { POST_ACTIVITY } from '../../src/actions/postActivity';
import * as ActivityClientState from '../../src/constants/ActivityClientState';

test('Post activity success', async () => {
  const { actions, directLine, store } = await createFacility();

  // Clear out actions
  actions.splice(0);

  store.dispatch({
    type: POST_ACTIVITY,
    payload: {
      activity: {
        type: 'message',
        text: 'Hello, World!'
      }
    }
  });

  await 0;
  expect(directLine.pendingPosts.map(post => post.peek())).toMatchSnapshot('pending to send: activity');
  expect(store.getState().activities).toMatchSnapshot('pending to send: store');
  expect(store.getState().activities[0]).toHaveProperty('channelData.state', ActivityClientState.SENDING);
  expect(store.getState().activities[0]).not.toHaveProperty('id');

  directLine.pendingPosts[0].complete('server-id:123');

  await 0;
  expect(actions).toMatchSnapshot('send completed: actions');
  expect(store.getState().activities).toMatchSnapshot('send completed: store');
  expect(store.getState().activities[0]).toHaveProperty('channelData.state', ActivityClientState.SENT);
  expect(store.getState().activities[0]).toHaveProperty('id');
});
