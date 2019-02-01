import {
  put,
  takeEvery
} from 'redux-saga/effects';

import speakableActivity from '../definitions/speakableActivity';

import whileConnected from './effects/whileConnected';
import whileSpeakIncomingActivity from './effects/whileSpeakIncomingActivity';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import markActivity from '../actions/markActivity';

export default function* () {
  yield whileConnected(function* ({ userID }) {
    yield whileSpeakIncomingActivity(markActivityForSpeakOnIncomingActivityFromOthers.bind(null, userID));
  });
}

function* markActivityForSpeakOnIncomingActivityFromOthers(userID) {
  yield takeEvery(
    ({ payload, type }) => (
      type === INCOMING_ACTIVITY
      && speakableActivity(payload.activity)
      && payload.activity.from.id !== userID
    ),
    markActivityForSpeak
  );
}

function* markActivityForSpeak({ payload: { activity } }) {
  yield put(markActivity(activity, 'speak', true));
}
