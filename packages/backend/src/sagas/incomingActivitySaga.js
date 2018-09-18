import {
  put,
  select
} from 'redux-saga/effects';

import observeEach from './effects/observeEach';
import whileConnected from './effects/whileConnected';

import setSuggestedActions from '../actions/setSuggestedActions';
import upsertActivity from '../actions/upsertActivity';

function last(array, predicate) {
  for (let i = array.length - 1; i >= 0; i--) {
    const item = array[i];

    if (predicate.call(array, item)) {
      return item;
    }
  }
}

export default function* () {
  yield whileConnected(function* (directLine, userID) {
    yield observeEach(directLine.activity$, function* (activity) {
      activity = { ...activity };

      // Patch activity.from.role to make sure its either "bot", "user", or "channel"
      if (!activity.from.role) {
        if (activity.from.id === userID) {
          activity.from.role = 'user';
        } else {
          activity.from.role = 'bot';
        }
      }

      yield put(upsertActivity(activity));

      // Update suggested actions

      const activities = yield select(({ activities }) => activities);
      const lastMessageActivity = last(activities, ({ type }) => type === 'message');

      // TODO: Optimize by not sending redundant setSuggestedActions
      if (lastMessageActivity.from.id === userID) {
        yield put(setSuggestedActions());
      } else {
        const { suggestedActions: { actions } = {} } = lastMessageActivity;

        yield put(setSuggestedActions(actions));
      }
    });
  });
}
