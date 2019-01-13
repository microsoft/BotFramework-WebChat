import {
  call,
  put,
  takeLatest
} from 'redux-saga/effects';

import deleteActivity from '../actions/deleteActivity';
import { INCOMING_ACTIVITY } from '../actions/incomingActivity';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function* () {
  yield takeLatest(
    ({ type, payload }) => (
      type === INCOMING_ACTIVITY
      && payload.activity.type === 'typing'
    ),
    removeActivityAfterInterval
  );
}

function* removeActivityAfterInterval({ payload: { activity: { id } } }) {
  yield call(sleep, 5000);
  yield put(deleteActivity(id));
}
