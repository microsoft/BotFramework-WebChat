import { put, takeEvery } from 'redux-saga/effects';

import { EMIT_TYPING_INDICATOR } from '../actions/emitTypingIndicator';
import postActivity from '../actions/postActivity';
import whileConnected from './effects/whileConnected';

function* postTypingActivity() {
  yield put(
    postActivity({
      type: 'typing'
    })
  );
}

function* emitTypingActivityToPostActivity() {
  yield takeEvery(({ type }) => type === EMIT_TYPING_INDICATOR, postTypingActivity);
}

export default function* emitTypingActivityToPostActivitySaga() {
  yield whileConnected(emitTypingActivityToPostActivity);
}
