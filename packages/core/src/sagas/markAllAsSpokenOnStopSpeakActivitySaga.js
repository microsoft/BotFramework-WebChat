import {
  put,
  select,
  takeEvery
} from 'redux-saga/effects';

import markActivity from '../actions/markActivity';
import { STOP_SPEAKING_ACTIVITY } from '../actions/stopSpeakingActivity';

export default function* () {
  yield takeEvery(STOP_SPEAKING_ACTIVITY, function* () {
    const activities = yield select(({ activities }) => activities);

    for (let activity of activities) {
      if (activity.channelData && activity.channelData.speak) {
        yield put(markActivity(activity, 'speak', false));
      }
    }
  });
}
