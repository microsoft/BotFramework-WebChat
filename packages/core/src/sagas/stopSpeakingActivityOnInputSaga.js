import { put, takeEvery } from 'redux-saga/effects';

import { POST_ACTIVITY_PENDING } from '../actions/postActivity';
import { SET_SEND_BOX } from '../actions/setSendBox';
import { START_DICTATE } from '../actions/startDictate';
import stopSpeakingActivity from '../actions/stopSpeakingActivity';
import whileConnected from './effects/whileConnected';

function* stopSpeakingActivityOnInput() {
  yield takeEvery(
    ({ meta, payload, type }) =>
      type === START_DICTATE ||
      (type === SET_SEND_BOX && payload.text) ||
      // We want to stop speaking activity when the user click on a card action
      // But currently there are no actions generated out of a card action
      // So, right now, we are using best-effort by listening to POST_ACTIVITY_PENDING with a "message" event
      // We filter out speech because we will call startSpeakingActivity() for POST_ACTIVITY_PENDING dispatched by speech
      (type === POST_ACTIVITY_PENDING && meta.method !== 'speech' && payload.activity.type === 'message'),
    function*() {
      yield put(stopSpeakingActivity());
    }
  );
}

export default function* stopSpeakingActivityOnInputSaga() {
  yield whileConnected(stopSpeakingActivityOnInput);
}
