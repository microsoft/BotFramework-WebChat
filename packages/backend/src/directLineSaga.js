import { call, fork, put, race, take, takeEvery } from 'redux-saga/effects';

import createPromiseQueue from './createPromiseQueue';
import getTimestamp from './util/getTimestamp';
import observableToPromise from './util/observableToPromise';
import uniqueID from './util/uniqueID';

import { END_CONNECTION } from './Actions/endConnection';

import {
  POST_ACTIVITY,
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from './Actions/postActivity';

import { START_CONNECTION } from './Actions/startConnection';
import connectionStatusUpdate from './Actions/connectionStatusUpdate';
import receiveActivity, { RECEIVE_ACTIVITY } from './Actions/receiveActivity';

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
        yield fork(
          postActivity,
          directLine,
          {
            ...result.postActivity.payload.activity,
            from,
            timestamp: new Date().toISOString()
          }
        );
      } else if ('receiveActivity' in result) {
        yield put(receiveActivity(result.receiveActivity));
      } else if ('end' in result) {
        break;
      }
    }

    subscriptions.forEach(subscription => subscription.unsubscribe());
  });
}

function* postActivity(directLine, activity) {
  const clientActivityID = uniqueID();

  activity = {
    ...activity,
    channelData: {
      clientActivityID,
      ...activity.channelData
    },
    timestamp: getTimestamp()
  };

  delete activity.id;

  const meta = { activity, clientActivityID };

  yield put({
    type: POST_ACTIVITY_PENDING,
    meta
  });

  try {
    yield call(observableToPromise, directLine.postActivity(activity));
  } catch (err) {
    yield put({
      type: POST_ACTIVITY_REJECTED,
      error: true,
      meta,
      payload: err
    });

    return;
  }

  const echoedAction = yield take(({ payload, type }) => {
    const { activity: { channelData = {} } } = payload;

    return type === RECEIVE_ACTIVITY && channelData.clientActivityID === clientActivityID;
  });

  yield put({
    type: POST_ACTIVITY_FULFILLED,
    meta,
    payload: { activity: echoedAction.payload.activity }
  });
}
