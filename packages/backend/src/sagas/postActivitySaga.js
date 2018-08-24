import {
  cancelled,
  put,
  take,
  takeEvery
} from 'redux-saga/effects';

import updateIn from 'simple-update-in';

import callWithin from './effects/callWithin';
import observeOnce from './effects/observeOnce';
import whileConnected from './effects/whileConnected';

import deleteKey from '../util/deleteKey';
import getTimestamp from '../util/getTimestamp';
import uniqueID from '../util/uniqueID';

import {
  POST_ACTIVITY,
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../Actions/postActivity';

import { UPSERT_ACTIVITY } from '../Actions/upsertActivity';

const SEND_TIMEOUT = 5000;

export default function* () {
  yield whileConnected(function* (directLine) {
    yield takeEvery(POST_ACTIVITY, postActivity.bind(null, directLine));
  });
}

function* postActivity(directLine, { payload: { activity } }) {
  const { channelData: { clientActivityID = uniqueID() } = {} } = activity;

  activity = {
    ...deleteKey(activity, 'id'),
    channelData: {
      clientActivityID,
      ...activity.channelData
    },
    timestamp: getTimestamp()
  };

  const meta = { clientActivityID };

  yield put({ type: POST_ACTIVITY_PENDING, meta });

  try {
    yield put({ type: UPSERT_ACTIVITY, payload: { activity: updateIn(activity, ['channelData', 'state'], () => 'sending') } });
    yield observeOnce(directLine.postActivity(activity));

    const { payload: { activity: echoBack } } = yield callWithin(function* () {
      return yield take(({ payload, type }) => {
        if (type === UPSERT_ACTIVITY) {
          const { activity: { channelData = {}, id } } = payload;

          return channelData.clientActivityID === clientActivityID && id;
        }
      });
    }, [], SEND_TIMEOUT);

    yield put({ type: POST_ACTIVITY_FULFILLED, meta, payload: { echoBack } });
    yield put({ type: UPSERT_ACTIVITY, payload: { activity: updateIn(activity, ['channelData', 'state'], () => 'sent') } });
  } catch (err) {
    yield put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: err });
  } finally {
    if (yield cancelled()) {
      yield put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: new Error('cancelled') });
    }
  }
}
