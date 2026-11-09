import { put, takeEvery } from 'redux-saga/effects';

import { SEND_FILES } from '../actions/sendFiles';
import postActivity from '../actions/postActivity';
import { filesToActivity, hasFilesToSend } from '../services/private/sendPayloadToActivity';
import whileConnected from './effects/whileConnected';

function* postActivityWithFiles({ payload }) {
  yield put(postActivity(filesToActivity(payload)));
}

function* sendFilesToPostActivity() {
  yield takeEvery(({ payload, type }) => type === SEND_FILES && hasFilesToSend(payload), postActivityWithFiles);
}

export default function* sendFilesToPostActivitySaga() {
  yield whileConnected(sendFilesToPostActivity);
}
