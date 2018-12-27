import {
  put,
  select
} from 'redux-saga/effects';

import updateIn from 'simple-update-in';

import observeEach from './effects/observeEach';
import whileConnected from './effects/whileConnected';

import incomingActivity from '../actions/incomingActivity';
import setSuggestedActions from '../actions/setSuggestedActions';

function last(array, predicate) {
  for (let i = array.length - 1; i >= 0; i--) {
    const item = array[i];

    if (predicate.call(array, item)) {
      return item;
    }
  }
}

export default function* () {
  yield whileConnected(observeActivity);
}

function* observeActivity(directLine, userID) {
  yield observeEach(directLine.activity$, function* (activity) {
    activity = patchActivityWithFromRole(activity, userID);

    yield put(incomingActivity(activity));

    // Update suggested actions
    const { activities } = yield select();
    const lastMessageActivity = last(activities, ({ type }) => type === 'message');

    // TODO: [P2] Consider using "definitions/activityFromBot"
    if (lastMessageActivity && lastMessageActivity.from.role === 'bot') {
      const { suggestedActions: { actions } = {} } = lastMessageActivity;

      yield put(setSuggestedActions(actions));
    }
  });
}

function patchActivityWithFromRole(activity, userID) {
  // Patch activity.from.role to make sure its either "bot", "user", or "channel"
  if (!activity.from) {
    activity = updateIn(activity, ['from', 'role'], () => 'channel');
  } else if (!activity.from.role) {
    if (activity.from.id === userID) {
      activity = updateIn(activity, ['from', 'role'], () => 'user');
    } else if (activity.from.id) {
      activity = updateIn(activity, ['from', 'role'], () => 'bot');
    } else {
      activity = updateIn(activity, ['from', 'role'], () => 'channel');
    }
  }

  return activity;
}
