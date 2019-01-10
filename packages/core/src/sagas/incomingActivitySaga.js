import {
  put,
  select
} from 'redux-saga/effects';

import updateIn from 'simple-update-in';

import incomingActivity from '../actions/incomingActivity';
import setSuggestedActions from '../actions/setSuggestedActions';

import activityFromBot from '../definitions/activityFromBot';

import observeEach from './effects/observeEach';
import whileConnected from './effects/whileConnected';

import { ofType as activitiesOfType } from '../selectors/activities';

export default function* () {
  yield whileConnected(observeActivity);
}

function* observeActivity(directLine, userID) {
  yield observeEach(directLine.activity$, function* (activity) {
    activity = patchActivityWithFromRole(activity, userID);

    yield put(incomingActivity(activity));

    // Update suggested actions
    const messageActivities = yield select(activitiesOfType('message'));
    const lastMessageActivity = messageActivities[messageActivities.length - 1];

    if (activityFromBot(lastMessageActivity)) {
      const { suggestedActions: { actions } = {} } = lastMessageActivity;

      yield put(setSuggestedActions(actions));
    }
  });
}

function patchActivityWithFromRole(activity, userID) {
  // Some activities, such as "ConversationUpdate", does not have "from" defined.
  // And although "role" is defined in Direct Line spec, it was not sent over the wire.
  // We normalize the activity here to simplify null-check and logic later.

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
