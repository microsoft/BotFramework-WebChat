import {
  call,
  put,
  takeLatest
} from 'redux-saga/effects';

import deleteActivity from '../Actions/deleteActivity';
import { UPSERT_ACTIVITY } from '../Actions/upsertActivity';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isTypingActivity({
  type,
  payload
}) {
  if (type === UPSERT_ACTIVITY) {
    const { activity: { type } } = payload;

    return type === 'typing';
  }
}

export default function* () {
  yield takeLatest(isTypingActivity, function* ({ payload: { activity } }) {
    const id = activity.id;

    yield call(sleep, 5000);
    yield put(deleteActivity(id));
  });
}
