import {
  put,
  race,
  select,
  take
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import markActivity from '../actions/markActivity';
import stopSpeakingActivity from '../actions/stopSpeakingActivity';
import { SET_SEND_BOX } from '../actions/setSendBox';
import { START_SPEECH_INPUT } from '../actions/startSpeechInput';

export default function* () {
  yield whileConnected(function* () {
    for (;;) {
      // TODO: Also stop on card actions
      yield take(({ payload, type }) => type === START_SPEECH_INPUT || (type === SET_SEND_BOX && payload.text && payload.via !== 'speech'));
      yield put(stopSpeakingActivity());

      const activities = yield select(({ activities }) => activities);

      for (let activity of activities) {
        if (activity.channelData && activity.channelData.speak) {
          yield put(markActivity(activity, 'speak', false));
        }
      }
    }
  });
}
