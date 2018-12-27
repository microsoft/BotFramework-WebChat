import {
  put,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SEND_MESSAGE } from '../actions/sendMessage';
import postActivity from '../actions/postActivity';

export default function* () {
  yield whileConnected(sendMessageToPostActivity);
}

function* sendMessageToPostActivity() {
  yield takeEvery(({ payload, type }) => (
    type === SEND_MESSAGE
    && payload.text
  ), postActivityWithMessage);
}

function* postActivityWithMessage({ payload: { method, text } }) {
  yield put(postActivity({
    text,
    textFormat: 'plain',
    type: 'message'
  }, method));
}
