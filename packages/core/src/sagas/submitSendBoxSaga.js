import { put, select, takeEvery } from 'redux-saga/effects';

import { SUBMIT_SEND_BOX } from '../actions/submitSendBox';
import sendBoxValueSelector from '../selectors/sendBoxValue';
import sendMessage from '../actions/sendMessage';
import setSendBox from '../actions/setSendBox';
import whileConnected from './effects/whileConnected';

function* submitSendBox() {
  yield takeEvery(SUBMIT_SEND_BOX, function* ({ payload: { channelData, method } }) {
    const sendBoxValue = yield select(sendBoxValueSelector);

    // TODO: [P2] If the trimmed value is empty, we should not send.
    // TODO: [P2] We should expose this logic ("cannot send empty message") to other components such as UI.
    if (sendBoxValue) {
      yield put(sendMessage(sendBoxValue.trim(), method, { channelData }));
      yield put(setSendBox(''));
    }
  });
}

export default function* submitSendBoxSaga() {
  // TODO: [P2] We should expose this logic ("send only when connected") to other components such as UI.
  yield whileConnected(submitSendBox);
}
