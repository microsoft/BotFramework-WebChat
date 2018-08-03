// 1. postActivity
// 2. new incoming activity
// 3. look for incoming activity
// 4. complete postActivity
// 5. look for posted activity

import createFacility from '../createFacility';
import { POST_ACTIVITY } from '../../src/Actions/postActivity';

test('Post activity success', async () => {
  const { actions, directLine, store } = await createFacility();

  // Clear out actions
  actions.splice(0);

  store.dispatch({
    type: POST_ACTIVITY,
    payload: {
      activity: {
        type: 'message',
        text: 'Outgoing'
      }
    }
  });

  await 0;
  expect(directLine.pendingPosts).toHaveProperty('length', 1);
  expect(store.getState().activities[0]).toHaveProperty('channelData.state', 'sending');

  // Receive an activity while a message is pending to post
  directLine.activity.next({
    id: 'bot:1',
    text: 'Incoming',
    type: 'message'
  });

  await 0;
  expect(store.getState().activities).toHaveProperty('length', 2);
  expect(store.getState().activities[0]).toHaveProperty('channelData.state', 'sending');
  expect(store.getState().activities[0]).toHaveProperty('text', 'Outgoing');
  expect(store.getState().activities[1]).toHaveProperty('id', 'bot:1');

  directLine.pendingPosts[0].complete('user:1');
  await 0;

  expect(store.getState().activities[0]).toHaveProperty('channelData.state', 'sent');
  expect(store.getState().activities[0]).toHaveProperty('id', 'user:1');
});
