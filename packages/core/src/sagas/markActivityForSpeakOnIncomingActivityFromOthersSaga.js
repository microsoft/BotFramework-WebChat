import { fork, put, select, takeEvery } from 'redux-saga/effects';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import markActivity from '../actions/markActivity';
import speakableActivity from '../definitions/speakableActivity';
import startDictate from '../actions/startDictate';
import whileConnected from './effects/whileConnected';
import shouldSpeakIncomingActivitySelector from '../selectors/shouldSpeakIncomingActivity';
import stopDictate from '../actions/stopDictate';

export default function* markActivityForSpeakOnIncomingActivityFromOthersSaga() {
  yield whileConnected(function* markActivityForSpeakOnIncomingActivityFromOthersSaga({ userID }) {
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
