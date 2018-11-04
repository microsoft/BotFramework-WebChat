import {
  cancel,
  fork,
  put,
  take,
  takeEvery
} from 'redux-saga/effects';

import speakableActivity from './definition/speakableActivity';
import whileConnected from './effects/whileConnected';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { START_SPEAKING_ACTIVITY } from '../actions/startSpeakingActivity';
import { STOP_SPEAKING_ACTIVITY } from '../actions/stopSpeakingActivity';
import markActivity from '../actions/markActivity';

export default function* () {
  yield whileConnected(function* (_, userID) {
    for (;;) {
      yield take(START_SPEAKING_ACTIVITY);

      const task = fork(function* () {
        yield takeEvery(
          ({ payload, type }) =>
            type === INCOMING_ACTIVITY
            && payload
            && payload.activity
            && speakableActivity(payload.activity, userID),
          function* ({ payload: { activity } }) {
            yield put(markActivity(activity, 'speak', true));
          }
        );
      });

      yield take(STOP_SPEAKING_ACTIVITY);
      yield cancel(task);
    }
  });
}
