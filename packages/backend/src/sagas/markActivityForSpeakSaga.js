import {
  cancel,
  fork,
  put,
  take
} from 'redux-saga/effects';

import speakableActivity from './definition/speakableActivity';
import whileConnected from './effects/whileConnected';

import { START_SPEAKING_ACTIVITY } from '../Actions/startSpeakingActivity';
import { STOP_SPEAKING_ACTIVITY } from '../Actions/stopSpeakingActivity';
import { UPSERT_ACTIVITY } from '../Actions/upsertActivity';
import markActivity from '../Actions/markActivity';

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
