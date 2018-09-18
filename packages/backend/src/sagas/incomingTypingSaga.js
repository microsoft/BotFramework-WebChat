import {
  call,
  put,
  takeLatest
} from 'redux-saga/effects';

import deleteActivity from '../actions/deleteActivity';
import { UPSERT_ACTIVITY } from '../actions/upsertActivity';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isTypingActivity({ type, payload }) {
  return type === UPSERT_ACTIVITY && payload.activity.type === 'typing';
}

export default function* () {
  yield takeLatest(isTypingActivity, function* ({ payload: { activity } }) {
    const id = activity.id;

    yield call(sleep, 5000);
    yield put(deleteActivity(id));
  });
}
