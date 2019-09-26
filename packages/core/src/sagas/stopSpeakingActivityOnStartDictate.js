import { put, takeEvery } from 'redux-saga/effects';

import { START_DICTATE } from '../actions/startDictate';
import stopSpeakingActivity from '../actions/stopSpeakingActivity';
import whileConnected from './effects/whileConnected';

function* stopSpeakingActivityOnStartDictate() {
  yield takeEvery(START_DICTATE, function*() {
    yield put(stopSpeakingActivity());
  });
}

export default function* stopSpeakingActivityOnStartDictateSaga() {
  yield whileConnected(stopSpeakingActivityOnStartDictate);
}
