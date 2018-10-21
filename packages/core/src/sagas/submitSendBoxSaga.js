import {
  put,
  select,
  take
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SUBMIT_SEND_BOX } from '../actions/submitSendBox';
import sendMessage from '../actions/sendMessage';
import setSendBox from '../actions/setSendBox';

export default function* () {
  yield whileConnected(function* () {
    for (;;) {
      const { payload: { via } } = yield take(SUBMIT_SEND_BOX);
<<<<<<< HEAD
      const sendBoxValue = yield select(({ sendBoxValue }) => sendBoxValue);
=======
      const sendBoxValue = yield select(({ input: { sendBoxValue } }) => sendBoxValue);
>>>>>>> Simplify Provider/connect and hide Redux

      if (sendBoxValue) {
        yield put(sendMessage(sendBoxValue, via));
        yield put(setSendBox('', 'keyboard'));
      }
    }
  });
}
