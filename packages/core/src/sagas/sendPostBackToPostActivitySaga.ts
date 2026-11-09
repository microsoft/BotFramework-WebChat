import { put, takeEvery } from 'redux-saga/effects';
import postActivity from '../actions/postActivity';
import type sendPostBack from '../actions/sendPostBack';
import { SEND_POST_BACK } from '../actions/sendPostBack';
import { postBackToActivity } from '../services/private/sendPayloadToActivity';
import whileConnected from './effects/whileConnected';

function* postActivityWithPostBack({ payload }: ReturnType<typeof sendPostBack>) {
  yield put(postActivity(postBackToActivity(payload)));
}

function* sendPostBackToPostActivity() {
  yield takeEvery(SEND_POST_BACK, postActivityWithPostBack);
}

export default function* sendPostBackToPostActivitySaga() {
  yield whileConnected(sendPostBackToPostActivity);
}
