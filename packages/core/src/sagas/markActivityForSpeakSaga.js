import {
  put,
  takeEvery
} from 'redux-saga/effects';

import speakableActivity from './definition/speakableActivity';
import whileConnected from './effects/whileConnected';
import whileSpeaking from './effects/whileSpeaking';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import markActivity from '../actions/markActivity';

export default function* () {
  yield whileConnected(function* (_, userID) {
    yield whileSpeaking(function* () {
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
  });
}
