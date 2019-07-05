import { fork, put, select, takeEvery } from 'redux-saga/effects';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import markActivity from '../actions/markActivity';
import speakableActivity from '../definitions/speakableActivity';
import startDictate from '../actions/startDictate';
import whileConnected from './effects/whileConnected';
// import whileSpeakIncomingActivity from './effects/whileSpeakIncomingActivity';
import shouldSpeakIncomingActivitySelector from '../selectors/shouldSpeakIncomingActivity';
import stopDictate from '../actions/stopDictate';

// function* markActivityForSpeakAndStartDictate({ payload: { activity } }) {
//   yield put(markActivity(activity, 'speak', true));

//   // We will start dictate as soon as we receive an activity.
//   // Although we start dictate, the UI will not record on the microphone until all activities that mark to speak, is all spoken.

//   if (activity.inputHint !== 'ignoringInput') {
//     yield put(startDictate());
//   }
// }

// function* markActivityForSpeakOnIncomingActivityFromOthers(userID) {
//   yield takeEvery(
//     ({ payload, type }) =>
//       type === INCOMING_ACTIVITY && payload.activity.from.id !== userID && speakableActivity(payload.activity),
//     // (payload.activity.inputHint === 'expectingInput' ||
//     //   (speakableActivity(payload.activity) && payload.activity.inputHint !== 'ignoringInput')),
//     markActivityForSpeakAndStartDictate
//   );
// }

export default function* markActivityForSpeakOnIncomingActivityFromOthersSaga() {
  yield whileConnected(function* markActivityForSpeakOnIncomingActivityFromOthersSaga({ userID }) {
    // yield fork(function*() {
    //   yield whileSpeakIncomingActivity(markActivityForSpeakOnIncomingActivityFromOthers.bind(null, userID));
    // });

    yield takeEvery(
      ({ payload, type }) => type === INCOMING_ACTIVITY && payload.activity.from.id !== userID,
      function*({ payload: { activity } }) {
        const shouldSpeakIncomingActivity = yield select(shouldSpeakIncomingActivitySelector);
        const shouldSpeak = speakableActivity(activity) && shouldSpeakIncomingActivity;

        if (shouldSpeak && (activity.speak || activity.text)) {
          yield put(markActivity(activity, 'speak', true));
        }

        if (activity.inputHint === 'expectingInput' || (shouldSpeak && activity.inputHint !== 'ignoringInput')) {
          yield put(startDictate());
        } else if (activity.inputHint === 'ignoringInput') {
          yield put(stopDictate());
        }
      }
    );
  });
}
