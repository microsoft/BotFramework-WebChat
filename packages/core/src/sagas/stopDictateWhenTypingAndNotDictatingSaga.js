import { put, select, takeEvery } from 'redux-saga/effects';

import { SET_SEND_BOX } from '../actions/setSendBox';
import stopDictate from '../actions/stopDictate';
import speakingActivity from '../definitions/speakingActivity';
import whileConnected from './effects/whileConnected';

function* stopDictateWhenTypingAndNotDictating() {
  yield takeEvery(({ payload, type }) => type === SET_SEND_BOX && payload.text, function*() {
    const numSpeakingActivities = yield select(({ activities }) => !!activities.filter(speakingActivity));

    if (numSpeakingActivities) {
      yield put(stopDictate());
    }
  });
}

// This saga is for this scenario:
// - The user say something
// - The bot response and Web Chat is synthesizing
// - The user type something on the keyboard, while Web Chat is synthesizing bot's activity
// - Expected: we should not start microphone after Web Chat finished synthesizing bot's activity, because the user typed on the keyboard
export default function* stopDictateWhenTypingAndNotDictatingSaga() {
  yield whileConnected(stopDictateWhenTypingAndNotDictating);
}
