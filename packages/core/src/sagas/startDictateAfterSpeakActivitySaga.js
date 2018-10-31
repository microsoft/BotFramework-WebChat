import {
  cancel,
  fork,
  put,
  select,
  take
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { MARK_ACTIVITY } from '../actions/markActivity';
import { START_SPEAKING_ACTIVITY } from '../actions/startSpeakingActivity';
import { STOP_SPEAKING_ACTIVITY } from '../actions/stopSpeakingActivity';
import startDictate from '../actions/startDictate';

export default function* () {
  yield whileConnected(function* (_, userID) {
    for (;;) {
      yield take(START_SPEAKING_ACTIVITY);

      const task = yield fork(startDictateAfterSpeakActivitySaga, userID);

      yield take(STOP_SPEAKING_ACTIVITY);
      yield cancel(task);
    }
  });
}

function* startDictateAfterSpeakActivitySaga() {
  for (;;) {
    const { payload: { activityID } } = yield take(({ payload, type }) => type === MARK_ACTIVITY && payload.name === 'speak' && payload.value === false);
    const activities = yield select(({ activities }) => activities);

    if (!activities.some(activity => activity.id !== activityID && activity.channelData && activity.channelData.speak === true)) {
      yield put(startDictate());
    }
  }
}
