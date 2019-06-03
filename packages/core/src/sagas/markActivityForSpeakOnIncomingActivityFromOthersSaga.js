import { put, takeEvery } from 'redux-saga/effects';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import markActivity from '../actions/markActivity';
import speakableActivity from '../definitions/speakableActivity';
import whileConnected from './effects/whileConnected';
import whileSpeakIncomingActivity from './effects/whileSpeakIncomingActivity';

function* markActivityForSpeak({ payload: { activity } }) {
  yield put(markActivity(activity, 'speak', true));
}

function* markActivityForSpeakOnIncomingActivityFromOthers(userID) {
  yield takeEvery(
    ({ payload, type }) =>
      type === INCOMING_ACTIVITY && speakableActivity(payload.activity) && payload.activity.from.id !== userID,
    markActivityForSpeak
  );
}

export default function* markActivityForSpeakOnIncomingActivityFromOthersSaga() {
  yield whileConnected(function* markActivityForSpeakOnIncomingActivityFromOthersSaga({ userID }) {
    yield whileSpeakIncomingActivity(markActivityForSpeakOnIncomingActivityFromOthers.bind(null, userID));
  });
}
