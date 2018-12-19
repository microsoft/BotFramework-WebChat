import {
  put,
  select,
  takeEvery
} from 'redux-saga/effects';

import { STOP_SPEAKING_ACTIVITY } from '../actions/stopSpeakingActivity';
import markActivity from '../actions/markActivity';

export default function* () {
  yield takeEvery(STOP_SPEAKING_ACTIVITY, function* () {
    const { activities } = yield select();

    for (let activity of activities) {
      if (activity.channelData && activity.channelData.speak) {
        yield put(markActivity(activity, 'speak', false));
      }
    }
  });
}
