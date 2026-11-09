import { put, select, takeEvery } from 'redux-saga/effects';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import markActivity from '../actions/markActivity';
import setDictateState from '../actions/setDictateState';
import stopDictate from '../actions/stopDictate';
import { IDLE, WILL_START } from '../constants/DictateState';
import speakableActivity from '../definitions/speakableActivity';
import dictateStateSelector from '../selectors/dictateState';
import shouldSpeakIncomingActivitySelector from '../selectors/shouldSpeakIncomingActivity';
import { hasSpeakableContent, isFromOthers } from '../services/private/speakableIncomingActivity';
import whileConnected from './effects/whileConnected';

function* speakActivityAndStartDictateOnIncomingActivityFromOthers({ userID }) {
  yield takeEvery(
    ({ payload, type }) => type === INCOMING_ACTIVITY && isFromOthers(payload.activity, userID),
    function* ({ payload: { activity } }) {
      const shouldSpeakIncomingActivity = yield select(shouldSpeakIncomingActivitySelector);
      const dictateState = yield select(dictateStateSelector);
      const shouldSpeak = speakableActivity(activity) && shouldSpeakIncomingActivity;

      if (shouldSpeak && hasSpeakableContent(activity)) {
        yield put(markActivity(activity, 'speak', true));
      }

      if (shouldSpeak && activity.inputHint === 'expectingInput') {
        // In continuous mode (dictateState === LISTENING), we shouldn't set it to WILL_START.
        // WILL_START means auto start after synthesis completed.
        if (dictateState === IDLE) {
          yield put(setDictateState(WILL_START));
        }
      } else if (activity.inputHint === 'ignoringInput') {
        yield put(stopDictate());
      }
    }
  );
}

export default function* speakActivityAndStartDictateOnIncomingActivityFromOthersSaga() {
  yield whileConnected(speakActivityAndStartDictateOnIncomingActivityFromOthers);
}
