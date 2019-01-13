import {
  call,
  cancel,
  put,
  select,
  take,
  takeLatest
} from 'redux-saga/effects';

import { SET_SEND_BOX } from '../actions/setSendBox';
import { SET_SEND_TYPING } from '../actions/setSendTyping';
import postActivity from '../actions/postActivity';

import whileConnected from './effects/whileConnected';

import sendTypingSelector from '../selectors/sendTyping';

import sleep from '../utils/sleep';

const SEND_INTERVAL = 3000;

function takeSendTyping(value) {
  return take(({ payload, type }) => type === SET_SEND_TYPING && !payload.sendTyping === !value);
}

export default function* () {
  yield whileConnected(sendTypingOnSetSendBox);
}

function* sendTypingOnSetSendBox() {
  const sendTyping = yield select(sendTypingSelector);

  if (!sendTyping) {
    yield takeSendTyping(true);
  }

  for (;;) {
    let lastSend = 0;
    const task = yield takeLatest(
      ({ payload, type }) => (
        type === SET_SEND_BOX
        && payload.text
      ),
      function* () {
        const interval = SEND_INTERVAL - Date.now() + lastSend;

        if (interval > 0) {
          yield call(sleep, interval);
        }

        yield put(postActivity({ type: 'typing' }));

        lastSend = Date.now();
      }
    );

    yield takeSendTyping(false);
    yield cancel(task);
    yield takeSendTyping(true);
  }
}
