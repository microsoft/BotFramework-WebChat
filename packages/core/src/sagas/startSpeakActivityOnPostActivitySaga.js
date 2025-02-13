import { put, select, takeEvery } from 'redux-saga/effects';

import { POST_ACTIVITY_PENDING } from '../actions/postActivity';
import startSpeakingActivity from '../actions/startSpeakingActivity';
import { DICTATING } from '../constants/DictateState';
import dictateStateSelector from '../selectors/dictateState';
import whileConnected from './effects/whileConnected';

function* startSpeakActivityOnPostActivity() {
  yield takeEvery(
    ({ type }) => type === POST_ACTIVITY_PENDING,
    function* ({ meta, payload }) {
      const dictateState = yield select(dictateStateSelector);

      if (
        // In continuous mode (speech recognition is active), we should speak everything.
        dictateState === DICTATING ||
        // If last user message was sent via speech, we should speak bot response.
        (meta.method === 'speech' && payload.activity.type === 'message')
      ) {
        yield put(startSpeakingActivity());
      }
    }
  );
}

export default function* startSpeakActivityOnPostActivitySaga() {
  yield whileConnected(startSpeakActivityOnPostActivity);
}
