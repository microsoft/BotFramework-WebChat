import { put, select, takeEvery } from 'redux-saga/effects';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import markActivity from '../actions/markActivity';
import shouldSpeakIncomingActivitySelector from '../selectors/shouldSpeakIncomingActivity';
import speakableActivity from '../definitions/speakableActivity';
import startDictate from '../actions/startDictate';
import stopDictate from '../actions/stopDictate';
import whileConnected from './effects/whileConnected';

function* speakActivityAndStartDictateOnIncomingActivityFromOthers({ userID }) {
  yield takeEvery(({ payload, type }) => type === INCOMING_ACTIVITY && payload.activity.from.id !== userID, function*({
    payload: { activity }
  }) {
    const shouldSpeakIncomingActivity = yield select(shouldSpeakIncomingActivitySelector);
    const shouldSpeak = speakableActivity(activity) && shouldSpeakIncomingActivity;

    if (
      shouldSpeak &&
      (activity.speak ||
        activity.text ||
        ~(activity.attachments || []).findIndex(({ content: { speak } = {} }) => speak))
    ) {
      yield put(markActivity(activity, 'speak', true));
    }

    if (shouldSpeak && activity.inputHint === 'expectingInput') {
      yield put(startDictate());
    } else if (activity.inputHint === 'ignoringInput') {
      yield put(stopDictate());
    }
  });
}

export default function* speakActivityAndStartDictateOnIncomingActivityFromOthersSaga() {
  yield whileConnected(speakActivityAndStartDictateOnIncomingActivityFromOthers);
}
