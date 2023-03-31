// We will revisit this logic in #2157 and should remove the following eslint ignore
/* eslint require-atomic-updates: "off" */

import { call, cancel, put, select, take, takeLatest } from 'redux-saga/effects';

import { SET_SEND_BOX } from '../actions/setSendBox';
import { SET_SEND_TYPING_INDICATOR } from '../actions/setSendTypingIndicator';
import { POST_ACTIVITY } from '../actions/postActivity';
import emitTypingIndicator from '../actions/emitTypingIndicator';
import sendTypingIndicatorSelector from '../selectors/sendTypingIndicator';
import sleep from '../utils/sleep';
import whileConnected from './effects/whileConnected';

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type setSendTypingIndicator from '../actions/setSendTypingIndicator';

type SetSendTypingIndicatorAction = ReturnType<typeof setSendTypingIndicator>;

const SEND_INTERVAL = 3000;

function takeSendTypingIndicator(value: boolean) {
  return take<SetSendTypingIndicatorAction>(
    // TODO: "any" should be replaced all known types in the system.
    ({ payload, type }: any) => type === SET_SEND_TYPING_INDICATOR && !payload.sendTypingIndicator === !value
  );
}

function* sendTypingIndicatorOnSetSendBox(_, ponyfill: GlobalScopePonyfill) {
  const { Date } = ponyfill;
  const sendTypingIndicator = yield select(sendTypingIndicatorSelector);

  if (!sendTypingIndicator) {
    yield takeSendTypingIndicator(true);
  }

  for (;;) {
    let lastSend = -Infinity;
    const task = yield takeLatest(
      ({ payload, type }) =>
        (type === SET_SEND_BOX && payload.text) ||
        // Stop sending pending typing indicator if the user has posted anything.
        // We send typing indicator in a debounce way (t = 0, t = 3000, t = 6000).
        // When the user type, and then post the activity at t = 1500, we still have a pending typing indicator at t = 3000.
        // This code is to cancel the typing indicator at t = 3000.
        (type === POST_ACTIVITY && payload.activity.type !== 'typing'),
      function* ({ payload, type }) {
        if (type === SET_SEND_BOX) {
          const interval = SEND_INTERVAL - Date.now() + lastSend;

          if (interval > 0) {
            yield call(sleep, interval, ponyfill);
          }

          yield put(emitTypingIndicator());

          lastSend = Date.now();
        } else if (payload.activity.type === 'message') {
          lastSend = -Infinity;
        }
      }
    );

    yield takeSendTypingIndicator(false);
    yield cancel(task);
    yield takeSendTypingIndicator(true);
  }
}

export default function* sendTypingIndicatorOnSetSendBoxSaga(ponyfill: GlobalScopePonyfill) {
  yield whileConnected(sendTypingIndicatorOnSetSendBox, ponyfill);
}
