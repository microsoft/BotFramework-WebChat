import { put, select, takeEvery } from 'redux-saga/effects';

import { SUBMIT_SEND_BOX } from '../actions/submitSendBox';
import sendBoxValueSelector from '../selectors/sendBoxValue';
import sendMessage from '../actions/sendMessage';
import setSendBox from '../actions/setSendBox';
import whileConnected from './effects/whileConnected';

function* submitSendBox() {
  yield takeEvery(SUBMIT_SEND_BOX, function*({ payload: { method } }) {
    const sendBoxValue = yield select(sendBoxValueSelector);

    if (sendBoxValue) {
      yield put(sendMessage(sendBoxValue, method));
      yield put(setSendBox(''));
    }
  });
}

export default function* submitSendBoxSaga() {
  yield whileConnected(submitSendBox);
}
