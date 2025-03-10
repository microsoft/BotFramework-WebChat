import { put, select, takeEvery } from 'redux-saga/effects';

import sendMessage from '../actions/sendMessage';
import setSendBox from '../actions/setSendBox';
import setSendBoxAttachments from '../actions/setSendBoxAttachments';
import { SUBMIT_SEND_BOX } from '../actions/submitSendBox';
import sendBoxAttachmentsSelector from '../selectors/sendBoxAttachments';
import sendBoxValueSelector from '../selectors/sendBoxValue';
import whileConnected from './effects/whileConnected';

function* submitSendBox() {
  yield takeEvery(SUBMIT_SEND_BOX, function* ({ payload: { channelData, method } }) {
    const attachments = yield select(sendBoxAttachmentsSelector);
    const sendBoxValue = yield select(sendBoxValueSelector);

    // TODO: [P2] If the trimmed value is empty, we should not send.
    // TODO: [P2] We should expose this logic ("cannot send empty message") to other components such as UI.
    if (attachments.length || sendBoxValue) {
      yield put(sendMessage(sendBoxValue.trim(), method, { attachments, channelData }));

      yield put(setSendBox(''));
      yield put(setSendBoxAttachments(Object.freeze([])));
    }
  });
}

export default function* submitSendBoxSaga() {
  // TODO: [P2] We should expose this logic ("send only when connected") to other components such as UI.
  yield whileConnected(submitSendBox);
}
