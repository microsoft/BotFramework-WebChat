import { put, select, takeEvery } from 'redux-saga/effects';

import { POST_ACTIVITY_PENDING } from '../actions/postActivity';
import { SET_DICTATE_INTERIMS } from '../actions/setDictateInterims';
import { SET_SEND_BOX } from '../actions/setSendBox';
import stopSpeakingActivity from '../actions/stopSpeakingActivity';
import { DICTATING } from '../constants/DictateState';
import dictateStateSelector from '../selectors/dictateState';
import whileConnected from './effects/whileConnected';

function* stopSpeakingActivityOnInput() {
  yield takeEvery(
    ({ payload, type }) =>
      (type === SET_SEND_BOX && payload.text) ||
      // We want to stop speaking activity when the user click on a card action
      // But currently there are no actions generated out of a card action
      // So, right now, we are using best-effort by listening to POST_ACTIVITY_PENDING with a "message" event
      // We filter out speech because we will call startSpeakingActivity() for POST_ACTIVITY_PENDING dispatched by speech
      type === POST_ACTIVITY_PENDING ||
      // We want to stop speaking activity on barge-in.
      type === SET_DICTATE_INTERIMS,
    function* ({ meta, payload, type }) {
      const dictateState = yield select(dictateStateSelector);

      // If input is post activity, do not stop speaking if either one of the followings:
      // - In continuous mode (speech should kept as active as long as possible)
      // - Posting via speech (interactive mode, should speak bot response)
      // - Posting a non-message (interactive mode, not typing on keyboard, should be ignored)
      if (
        type === POST_ACTIVITY_PENDING &&
        (dictateState === DICTATING || meta.method === 'speech' || payload.activity.type !== 'message')
      ) {
        return;
      }

      yield put(stopSpeakingActivity());
    }
  );
}

export default function* stopSpeakingActivityOnInputSaga() {
  yield whileConnected(stopSpeakingActivityOnInput);
}
