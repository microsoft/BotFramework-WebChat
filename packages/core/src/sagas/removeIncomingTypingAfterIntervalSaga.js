import {
  call,
  put,
  takeEvery
} from 'redux-saga/effects';

import deleteActivity from '../actions/deleteActivity';
import { INCOMING_ACTIVITY } from '../actions/incomingActivity';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function* () {
  yield takeEvery(
    ({ type, payload }) => (
      type === INCOMING_ACTIVITY
      && payload.activity.type === 'typing'
    ),
    removeActivityAfterInterval
  );
}

function* removeActivityAfterInterval({ payload: { activity: { id } } }) {
  // TODO: [P2] We could optimize here.
  //       Given there is an activity typing activity, when the bot send another typing activity, we will remove the first one.
  //       That means, we don't actually need to remove it anymore, and could cancel out this call.
  yield call(sleep, 5000);
  yield put(deleteActivity(id));
}
