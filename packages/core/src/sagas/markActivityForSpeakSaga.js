import {
  cancel,
  fork,
  put,
  take
} from 'redux-saga/effects';

import speakableActivity from './definition/speakableActivity';
import whileConnected from './effects/whileConnected';

import { START_SPEAKING_ACTIVITY } from '../actions/startSpeakingActivity';
import { STOP_SPEAKING_ACTIVITY } from '../actions/stopSpeakingActivity';
import { UPSERT_ACTIVITY } from '../actions/upsertActivity';
import markActivity from '../actions/markActivity';

export default function* () {
  yield whileConnected(function* (_, userID) {
    for (;;) {
      yield take(START_SPEAKING_ACTIVITY);

      const task = yield fork(markActivityForSpeakSaga, userID);

      yield take(STOP_SPEAKING_ACTIVITY);
      yield cancel(task);
    }
  });
}

function* markActivityForSpeakSaga(userID) {
  for (;;) {
    const { payload: { activity } } = yield take(
      ({ payload: { activity } = {}, type }) =>
        type === UPSERT_ACTIVITY
        && speakableActivity(activity, userID)
    );

    yield put(markActivity(activity, 'speak', true));
  }
}
