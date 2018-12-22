import {
  put,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { POST_ACTIVITY_PENDING } from '../actions/postActivity';
import startSpeakingActivity from '../actions/startSpeakingActivity';
import stopSpeakingActivity from '../actions/stopSpeakingActivity';

export default function* () {
  yield whileConnected(function* () {
    yield takeEvery(
      ({ meta, payload, type }) => (
        type === POST_ACTIVITY_PENDING
        && meta.via === 'speech'
        && payload.activity.type === 'message'
      ),
      function* () {
        yield put(startSpeakingActivity());
      }
    );
  });
}
