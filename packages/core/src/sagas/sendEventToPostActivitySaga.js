import { put, takeEvery } from 'redux-saga/effects';

import { SEND_EVENT } from '../actions/sendEvent';
import postActivity from '../actions/postActivity';
import whileConnected from './effects/whileConnected';

function* postActivityWithEvent({ payload: { name, value } }) {
  yield put(
    postActivity({
      name,
      type: 'event',
      value
    })
  );
}

function* sendEventToPostActivity() {
  yield takeEvery(({ payload, type }) => type === SEND_EVENT && payload.name, postActivityWithEvent);
}

export default function* sendEventToPostActivitySaga() {
  yield whileConnected(sendEventToPostActivity);
}
