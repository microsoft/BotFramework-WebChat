import {
  put,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { POST_ACTIVITY_PENDING } from '../actions/postActivity';
import startSpeakingActivity from '../actions/startSpeakingActivity';

export default function* () {
  yield whileConnected(startSpeakActivityOnPostActivity);
}

function* startSpeakActivityOnPostActivity() {
  yield takeEvery(
    ({ meta, payload, type }) => (
      type === POST_ACTIVITY_PENDING
      && meta.method === 'speech'
      && payload.activity.type === 'message'
    ),
    function* () {
      yield put(startSpeakingActivity());
    }
  );
}
