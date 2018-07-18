import { call, put, race, take, takeEvery } from 'redux-saga/effects';

import { END_CONNECTION } from './Actions/endConnection';
import { POST_ACTIVITY } from './Actions/postActivity';
import { START_CONNECTION } from './Actions/startConnection';

import connectionStatusUpdate from './Actions/connectionStatusUpdate';
import receiveActivity from './Actions/receiveActivity';

import createPromiseQueue from './createPromiseQueue';

function pause(timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeout);
  });
}

export default function* () {
  yield takeEvery(START_CONNECTION, function* ({ payload: { directLine, userID, username } }) {
    const connectionStatusQueue = createPromiseQueue();
    const receiveActivityQueue = createPromiseQueue();
    const from = {
      id: userID,
      name: username
    };

    const subscriptions = [
      directLine.connectionStatus$.subscribe({
        next: connectionStatusQueue.push
      }),
      directLine.activity$.subscribe({
        next: receiveActivityQueue.push
      })
    ];

    for (;;) {
      const result = yield race({
        connectionStatus: call(connectionStatusQueue.shift),
        end: take(END_CONNECTION),
        postActivity: take(POST_ACTIVITY),
        receiveActivity: call(receiveActivityQueue.shift)
      });

      if ('connectionStatus' in result) {
        yield put(connectionStatusUpdate(result.connectionStatus));
      } else if ('postActivity' in result) {
        directLine.postActivity({
          ...result.postActivity.payload.activity,
          from
        });

        console.log({
          ...result.postActivity.payload.activity,
          from
        });
      } else if ('receiveActivity' in result) {
        yield put(receiveActivity(result.receiveActivity));
      } else if ('end' in result) {
        break;
      }
    }

    subscriptions.forEach(subscription => subscription.unsubscribe());
  });
}
