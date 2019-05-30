import { put, takeEvery } from 'redux-saga/effects';

import { POST_ACTIVITY_PENDING } from '../actions/postActivity';
import startSpeakingActivity from '../actions/startSpeakingActivity';
import whileConnected from './effects/whileConnected';

function* startSpeakActivityOnPostActivity() {
  yield takeEvery(
    ({ meta, payload, type }) =>
      type === POST_ACTIVITY_PENDING && meta.method === 'speech' && payload.activity.type === 'message',
    function*() {
      yield put(startSpeakingActivity());
    }
  );
}

export default function* startSpeakActivityOnPostActivitySaga() {
  yield whileConnected(startSpeakActivityOnPostActivity);
}
