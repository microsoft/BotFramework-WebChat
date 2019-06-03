import { call, cancel, fork, take } from 'redux-saga/effects';

import { START_SPEAKING_ACTIVITY } from '../../actions/startSpeakingActivity';
import { STOP_SPEAKING_ACTIVITY } from '../../actions/stopSpeakingActivity';

export default function whileSpeakIncomingActivityEffect(fn) {
  return call(function* whileSpeakIncomingActivity() {
    for (;;) {
      yield take(START_SPEAKING_ACTIVITY);

      const task = yield fork(fn);

      yield take(STOP_SPEAKING_ACTIVITY);
      yield cancel(task);
    }
  });
}
