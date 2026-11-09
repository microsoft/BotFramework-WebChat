import { put, takeEvery } from 'redux-saga/effects';
import postActivity from '../actions/postActivity';
import { SEND_MESSAGE_BACK, type SendMessageBackAction } from '../actions/sendMessageBack';
import { messageBackToActivity } from '../services/private/sendPayloadToActivity';
import whileConnected from './effects/whileConnected';

function* postActivityWithMessageBack({ payload }: SendMessageBackAction) {
  yield put(postActivity(messageBackToActivity(payload)));
}

function* sendMessageBackToPostActivity() {
  yield takeEvery(SEND_MESSAGE_BACK, postActivityWithMessageBack);
}

export default function* sendMessageBackToPostActivitySaga() {
  yield whileConnected(sendMessageBackToPostActivity);
}
