import {
  put,
  select,
  take
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import markActivity from '../Actions/markActivity';
import { START_SPEECH_INPUT } from '../Actions/startSpeechInput';

export default function* () {
  yield whileConnected(function* (_, userID) {
    for (;;) {
      // TODO: We should extend this to all types of input
      yield take(START_SPEECH_INPUT);

      const activities = yield select(({ activities }) => activities);

      for (let activity of activities) {
        if (activity.channelData && activity.channelData.speak) {
          yield put(markActivity(activity, 'speak', false));
        }
      }
    }
  });
}
