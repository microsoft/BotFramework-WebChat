import { call, fork, put, race, take, takeEvery } from 'redux-saga/effects';
import updateIn from 'simple-update-in';

import createPromiseQueue from './createPromiseQueue';
import getTimestamp from './util/getTimestamp';
import observableToPromise from './util/observableToPromise';
import uniqueID from './util/uniqueID';

import {
  POST_ACTIVITY,
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from './Actions/postActivity';

import { END_CONNECTION } from './Actions/endConnection';
import { START_CONNECTION } from './Actions/startConnection';
import connectionStatusUpdate from './Actions/connectionStatusUpdate';
import upsertActivity, { UPSERT_ACTIVITY } from './Actions/upsertActivity';

export default function* () {
  yield takeEvery(START_CONNECTION, function* ({ payload: { directLine, userID, username } }) {
    const connectionStatusQueue = createPromiseQueue();
    const activityQueue = createPromiseQueue();
    const from = {
      id: userID,
      name: username
    };

    const subscriptions = [
      directLine.connectionStatus$.subscribe({
        next: connectionStatusQueue.push
      }),
      directLine.activity$.subscribe({
        next: activityQueue.push
      })
    ];

    for (;;) {
      const result = yield race({
        activity: call(activityQueue.shift),
        connectionStatus: call(connectionStatusQueue.shift),
        end: take(END_CONNECTION),
        postActivity: take(POST_ACTIVITY)
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
      } else if ('activity' in result) {
        // TODO: Should we rename this to "upsertActivity"
        //       If it's an "upsertActivity", we can dispatch it thru "postActivity" during POST_ACTIVITY_PENDING to simplify code
        yield put(upsertActivity(result.activity));
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

  const meta = { clientActivityID };

  yield put({
    type: POST_ACTIVITY_PENDING,
    meta
  });

  yield put({
    type: UPSERT_ACTIVITY,
    payload: {
      activity: updateIn(activity, ['channelData', 'state'], () => 'sending')
    }
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
    const { activity: { channelData = {}, id } } = payload;

    return type === UPSERT_ACTIVITY && channelData.clientActivityID === clientActivityID && id;
  });

  yield put({
    type: POST_ACTIVITY_FULFILLED,
    meta,
    payload: { activity: echoedAction.payload.activity }
  });
}
