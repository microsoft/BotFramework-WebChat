import createFacility from '../createFacility';

import { POST_ACTIVITY, POST_ACTIVITY_REJECTED } from '../../src/actions/postActivity';
import * as ActivityClientState from '../../src/constants/ActivityClientState';

test('Post activity failed', async () => {
  const { actions, directLine, latestActions, store } = await createFacility();

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

  directLine.pendingPosts[0].error('some error');

  await 0;
  expect(actions).toMatchSnapshot('send failed: actions');
  expect(store.getState().activities).toMatchSnapshot('send failed: store');

  expect(latestActions[POST_ACTIVITY_REJECTED]).toHaveProperty('error', true);
  expect(latestActions[POST_ACTIVITY_REJECTED]).toHaveProperty('payload', 'some error');
  expect(store.getState().activities[0]).toHaveProperty('channelData.state', ActivityClientState.SEND_FAILED);
  expect(store.getState().activities[0]).not.toHaveProperty('id');
});
