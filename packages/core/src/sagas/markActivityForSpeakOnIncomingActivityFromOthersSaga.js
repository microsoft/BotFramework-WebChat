import { fork, put, takeEvery } from 'redux-saga/effects';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import markActivity from '../actions/markActivity';
import speakableActivity from '../definitions/speakableActivity';
import startDictate from '../actions/startDictate';
import whileConnected from './effects/whileConnected';
import whileSpeakIncomingActivity from './effects/whileSpeakIncomingActivity';

function* markActivityForSpeakAndStartDictate({ payload: { activity } }) {
  yield put(markActivity(activity, 'speak', true));

  // We will start dictate as soon as we receive an activity.
  // Although we start dictate, the UI will not record on the microphone until all activities that mark to speak, is all spoken.

  if (activity.inputHint !== 'ignoringInput') {
    yield put(startDictate());
  }
}

function* markActivityForSpeakOnIncomingActivityFromOthers(userID) {
  yield takeEvery(
    ({ payload, type }) =>
      type === INCOMING_ACTIVITY && payload.activity.from.id !== userID && speakableActivity(payload.activity),
    // (payload.activity.inputHint === 'expectingInput' ||
    //   (speakableActivity(payload.activity) && payload.activity.inputHint !== 'ignoringInput')),
    markActivityForSpeakAndStartDictate
  );
}

export default function* markActivityForSpeakOnIncomingActivityFromOthersSaga() {
  yield whileConnected(function* markActivityForSpeakOnIncomingActivityFromOthersSaga({ userID }) {
    yield fork(function*() {
      yield whileSpeakIncomingActivity(markActivityForSpeakOnIncomingActivityFromOthers.bind(null, userID));
    });

    yield takeEvery(
      ({ payload, type }) =>
        type === INCOMING_ACTIVITY &&
        payload.activity.from.id !== userID &&
        payload.activity.inputHint === 'expectingInput',
      function*() {
        yield put(startDictate());
      }
    );
  });
}
