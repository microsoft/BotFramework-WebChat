import {
  put,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { POST_ACTIVITY_PENDING } from '../actions/postActivity';
import setSuggestedActions from '../actions/setSuggestedActions';

export default function* () {
  yield whileConnected(function* () {
    yield takeEvery(
      ({ payload, type }) =>
        type === POST_ACTIVITY_PENDING
        && payload
        && payload.activity
        && payload.activity.type === 'message',
      function* () {
        yield put(setSuggestedActions());
      }
    );
  });
}
