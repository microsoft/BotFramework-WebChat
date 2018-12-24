import {
  put,
  takeEvery
} from 'redux-saga/effects';

import speakableActivity from './definition/speakableActivity';
import whileConnected from './effects/whileConnected';
import whileSpeakIncomingActivity from './effects/whileSpeakIncomingActivity';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import markActivity from '../actions/markActivity';

export default function* () {
  yield whileConnected(function* (_, userID) {
    yield whileSpeakIncomingActivity(markActivityForSpeakSaga.bind(null, userID));
  });
}

function* markActivityForSpeakSaga(userID) {
  yield takeEvery(
    ({ payload, type }) => (
      type === INCOMING_ACTIVITY
      && speakableActivity(payload.activity, userID)
    ),
    function* ({ payload: { activity } }) {
      yield put(markActivity(activity, 'speak', true));
    }
  );
}
