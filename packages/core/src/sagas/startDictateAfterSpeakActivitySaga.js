import {
  cancel,
  fork,
  put,
  select,
  take,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { MARK_ACTIVITY } from '../actions/markActivity';
import { START_SPEAKING_ACTIVITY } from '../actions/startSpeakingActivity';
import { STOP_SPEAKING_ACTIVITY } from '../actions/stopSpeakingActivity';
import startDictate from '../actions/startDictate';

export default function* () {
  yield whileConnected(function* () {
    for (;;) {
      yield take(START_SPEAKING_ACTIVITY);

      const task = yield fork(function* () {
        yield takeEvery(
          ({ payload, type }) =>
            type === MARK_ACTIVITY
            && payload
            && payload.name === 'speak'
            && payload.value === false,
          function* ({ payload: { activityID } }) {
            const activities = yield select(({ activities }) => activities);

            if (!activities.some(activity => activity.id !== activityID && activity.channelData && activity.channelData.speak === true)) {
              // TODO: [P2] We should also check inputHint
              //       acceptingInput = do nothing (or enable send box)
              //       expectingInput = enable dictate
              //       ignoringInput = do nothing (or disable send box)
              //       https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-add-input-hints?view=azure-bot-service-4.0&tabs=cs
              yield put(startDictate());
            }
          }
        );
      });

      yield take(STOP_SPEAKING_ACTIVITY);
      yield cancel(task);
    }
  });
}
