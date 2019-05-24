import { call, put, takeEvery } from 'redux-saga/effects';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import deleteActivity from '../actions/deleteActivity';

const REMOVE_TYPING_ACTIVITY_AFTER = 5000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function* removeActivityAfterInterval({
  payload: {
    activity: { id }
  }
}) {
  // TODO: [P2] We could optimize here.
  //       Given there is an activity typing activity, when the bot send another typing activity, we will remove the first one.
  //       That means, we don't actually need to remove it anymore, and could cancel out this call.
  yield call(sleep, REMOVE_TYPING_ACTIVITY_AFTER);
  yield put(deleteActivity(id));
}

export default function*() {
  yield takeEvery(
    ({ type, payload }) => type === INCOMING_ACTIVITY && payload.activity.type === 'typing',
    removeActivityAfterInterval
  );
}
