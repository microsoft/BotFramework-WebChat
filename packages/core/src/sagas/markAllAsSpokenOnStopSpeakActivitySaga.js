import {
  put,
  select,
  takeEvery
} from 'redux-saga/effects';

import speakingActivity from '../definitions/speakingActivity';

import { STOP_SPEAKING_ACTIVITY } from '../actions/stopSpeakingActivity';
import markActivity from '../actions/markActivity';

export default function* () {
  yield takeEvery(STOP_SPEAKING_ACTIVITY, markAllAsSpoken);
}

function* markAllAsSpoken() {
  const { activities } = yield select();

  for (let activity of activities) {
    if (speakingActivity(activity)) {
      yield put(markActivity(activity, 'speak', false));
    }
  }
}
