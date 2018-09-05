import {
  cancel,
  fork,
  put,
  take
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { START_SPEAKING_ACTIVITY } from '../Actions/startSpeakingActivity';
import { STOP_SPEAKING_ACTIVITY } from '../Actions/stopSpeakingActivity';
import { UPSERT_ACTIVITY } from '../Actions/upsertActivity';
import markActivity from '../Actions/markActivity';

export default function* () {
  yield whileConnected(function* (_, userID) {
    yield take(START_SPEAKING_ACTIVITY);

    const task = yield fork(markActivityForSpeak, userID);

    yield take(STOP_SPEAKING_ACTIVITY);
    yield cancel(task);
  });
}

function* markActivityForSpeak(userID) {
  for (;;) {
    const { payload: { activity } } = yield take(
      ({ payload: { activity } = {}, type }) =>
        type === UPSERT_ACTIVITY
        && activity
        && activity.from
        && activity.from.id !== userID
        && activity.type === 'message'
    );

    yield put(markActivity(activity, 'speak', true));
  }
}
