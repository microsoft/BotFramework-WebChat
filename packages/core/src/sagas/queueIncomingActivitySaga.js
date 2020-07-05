import { call, cancelled, fork, put, race, select, take } from 'redux-saga/effects';

import { QUEUE_INCOMING_ACTIVITY } from '../actions/queueIncomingActivity';
import activitiesSelector, { ofType as activitiesOfType } from '../selectors/activities';
import activityFromBot from '../definitions/activityFromBot';
import incomingActivity, { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import setSuggestedActions from '../actions/setSuggestedActions';
import sleep from '../utils/sleep';
import whileConnected from './effects/whileConnected';

// We will hold up the replying activity if the originating activity did not arrive, up to 5 seconds.
const REPLY_TIMEOUT = 5000;

function* takeEveryAndSelect(actionType, selector, fn) {
  // select() will free up the code execution.
  // If we pair up with takeEvery(), it will allow actions to slip through.
  // Thus, we are writing one that don't use takeEvery().
  while (!(yield cancelled())) {
    const action = yield take(actionType);
    const state = yield select(selector);

    yield fork(fn, action, state);
  }
}

// Wait for specific activity to arrive in the transcript.
// We will use the initial set of activities to close time gaps between select() and take().
function* waitForActivityId(replyToId, initialActivities) {
  let activities = initialActivities;

  for (;;) {
    const replied = activities.find(activity => activity.id === replyToId);

    if (replied) {
      break;
    }

    yield take(INCOMING_ACTIVITY);

    activities = yield select(activitiesSelector);
  }
}

function* queueIncomingActivity({ userID }) {
  yield takeEveryAndSelect(QUEUE_INCOMING_ACTIVITY, activitiesSelector, function* queueIncomingActivity(
    { payload: { activity } },
    initialActivities
  ) {
    // This is for accessibility issue.
    // If the incoming activity has "replyToId" field, hold on it until the activity replied to is in the transcript, then release this one.
    const { replyToId } = activity;

    if (replyToId) {
      // Either the activity replied to is in the transcript or after timeout.
      yield race([waitForActivityId(replyToId, initialActivities), call(sleep, REPLY_TIMEOUT)]);
    }

    yield put(incomingActivity(activity));

    // Update suggested actions
    // TODO: [P3] We could put this logic inside reducer to minimize number of actions dispatched.
    const messageActivities = yield select(activitiesOfType('message'));
    const lastMessageActivity = messageActivities[messageActivities.length - 1];

    if (activityFromBot(lastMessageActivity)) {
      const { suggestedActions: { actions, to } = {} } = lastMessageActivity;

      // If suggested actions is not destined to anyone, or is destined to the user, show it.
      // In other words, if suggested actions is destined to someone else, don't show it.
      yield put(setSuggestedActions(to && to.length && !to.includes(userID) ? null : actions));
    }
  });
}

export default function* queueIncomingActivitySaga() {
  yield whileConnected(queueIncomingActivity);
}
