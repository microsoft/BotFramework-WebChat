import { put, takeEvery } from 'redux-saga/effects';

import { SEND_EVENT } from '../actions/sendEvent';
import postActivity from '../actions/postActivity';
import { eventToActivity, hasEventToSend } from '../services/private/sendPayloadToActivity';
import whileConnected from './effects/whileConnected';

function* postActivityWithEvent({ payload }) {
  yield put(postActivity(eventToActivity(payload)));
}

function* sendEventToPostActivity() {
  yield takeEvery(({ payload, type }) => type === SEND_EVENT && hasEventToSend(payload), postActivityWithEvent);
}

export default function* sendEventToPostActivitySaga() {
  yield whileConnected(sendEventToPostActivity);
}
