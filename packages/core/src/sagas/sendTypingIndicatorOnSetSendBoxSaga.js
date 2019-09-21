// We will revisit this logic in #2157 and should remove the following eslint ignore
/* eslint require-atomic-updates: "off" */

import { call, cancel, put, select, take, takeLatest } from 'redux-saga/effects';

import { SET_SEND_BOX } from '../actions/setSendBox';
import { SET_SEND_TYPING } from '../actions/setSendTyping';
import { SET_SEND_TYPING_INDICATOR } from '../actions/setSendTypingIndicator';
import { POST_ACTIVITY } from '../actions/postActivity';
import emitTypingIndicator from '../actions/emitTypingIndicator';
import sendTypingIndicatorSelector from '../selectors/sendTypingIndicator';
import sleep from '../utils/sleep';
import whileConnected from './effects/whileConnected';

const SEND_INTERVAL = 3000;

function takeSendTypingIndicator(value) {
  return take(
    ({ payload, type }) =>
      (type === SET_SEND_TYPING_INDICATOR && !payload.sendTypingIndicator === !value) ||
      // TODO: [P3] Take this deprecation code out when releasing on or after January 13 2020
      (type === SET_SEND_TYPING && !payload.sendTyping === !value)
  );
}

function* sendTypingIndicatorOnSetSendBox() {
  const sendTypingIndicator = yield select(sendTypingIndicatorSelector);

  if (!sendTypingIndicator) {
    yield takeSendTypingIndicator(true);
  }

  for (;;) {
    let lastSend = 0;
    const task = yield takeLatest(
      ({ payload, type }) =>
        (type === SET_SEND_BOX && payload.text) ||
        // Stop sending pending typing indicator if the user has posted anything.
        // We send typing indicator in a debounce way (t = 0, t = 3000, t = 6000).
        // When the user type, and then post the activity at t = 1500, we still have a pending typing indicator at t = 3000.
        // This code is to cancel the typing indicator at t = 3000.
        (type === POST_ACTIVITY && payload.activity.type !== 'typing'),
      function*({ type }) {
        if (type === SET_SEND_BOX) {
          const interval = SEND_INTERVAL - Date.now() + lastSend;

          if (interval > 0) {
            yield call(sleep, interval);
          }

          yield put(emitTypingIndicator());

          lastSend = Date.now();
        }
      }
    );

    yield takeSendTypingIndicator(false);
    yield cancel(task);
    yield takeSendTypingIndicator(true);
  }
}

export default function* sendTypingIndicatorOnSetSendBoxSaga() {
  yield whileConnected(sendTypingIndicatorOnSetSendBox);
}
