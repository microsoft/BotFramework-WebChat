import { put, takeEvery } from 'redux-saga/effects';

import postActivity from '../actions/postActivity';
import sendMessage, { SEND_MESSAGE } from '../actions/sendMessage';
import { hasMessageToSend, messageToActivity } from '../services/private/sendPayloadToActivity';
import whileConnected from './effects/whileConnected';

function* postActivityWithMessage({ payload }: ReturnType<typeof sendMessage>) {
  yield put(postActivity(messageToActivity(payload), payload.method));
}

function* sendMessageToPostActivity() {
  yield takeEvery(({ payload, type }) => type === SEND_MESSAGE && hasMessageToSend(payload), postActivityWithMessage);
}

export default function* sendMessageToPostActivitySaga() {
  yield whileConnected(sendMessageToPostActivity);
}
