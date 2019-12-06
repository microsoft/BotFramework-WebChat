import { put, select, takeEvery } from 'redux-saga/effects';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { WILL_START } from '../constants/DictateState';
import markActivity from '../actions/markActivity';
import setDictateState from '../actions/setDictateState';
import shouldSpeakIncomingActivitySelector from '../selectors/shouldSpeakIncomingActivity';
import speakableActivity from '../definitions/speakableActivity';
import stopDictate from '../actions/stopDictate';
import whileConnected from './effects/whileConnected';

function* speakActivityAndStartDictateOnIncomingActivityFromOthers({ userID }) {
  yield takeEvery(
    ({ payload, type }) =>
      // In Direct Line, the "role" is not filled (yet), but we do know the user ID.
      // In Direct Line Speech, we do not know the user ID, but "role" is filled with "bot" or "user".
      // Here, we do two checks: the speakable activity must not have user ID, and must not have role === 'user'
      type === INCOMING_ACTIVITY && payload.activity.from.id !== userID && payload.activity.from.role !== 'user',
    function*({ payload: { activity } }) {
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
        yield put(setDictateState(WILL_START));
      } else if (activity.inputHint === 'ignoringInput') {
        yield put(stopDictate());
      }
    }
  );
}

export default function* speakActivityAndStartDictateOnIncomingActivityFromOthersSaga() {
  yield whileConnected(speakActivityAndStartDictateOnIncomingActivityFromOthers);
}
