import {
  cancelled,
  fork,
  join,
  put,
  select,
  take,
  takeEvery
} from 'redux-saga/effects';

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
  yield whileConnected(function* (directLine, userID) {
    yield takeEvery(POST_ACTIVITY, postActivity.bind(null, directLine, userID));
  });
}

function* postActivity(directLine, userID, { payload: { activity } }) {
  const locale = yield select(({ settings: { language } }) => language);
  const { attachments, channelData: { clientActivityID = uniqueID() } = {} } = activity;

  activity = {
    ...deleteKey(activity, 'id'),
    attachments: attachments && attachments.map(({ contentType, contentUrl, name }) => ({
      contentType,
      contentUrl,
      name
    })),
    channelData: {
      clientActivityID,
      ...deleteKey(activity.channelData, 'state')
    },
    from: {
      id: userID,
      role: 'user'
    },
    locale,
    timestamp: getTimestamp()
  };

  const meta = { clientActivityID };

  yield put({ type: POST_ACTIVITY_PENDING, payload: { activity }, meta });

  try {
    // Quirks: We might receive UPSERT_ACTIVITY before the postActivity call completed
    //         So, we setup expectation first, then postActivity afterward

    // // TODO: Make these debug switches
    // yield call(sleep, 500);

    // if (Math.random() < .5) {
    //   throw new Error('artificial error');
    // }

    const expectEchoBack = yield fork(() => callWithin(function* () {
      for (;;) {
        const { payload: { activity } } = yield take(UPSERT_ACTIVITY);
        const { channelData = {}, id } = activity;

        if (channelData.clientActivityID === clientActivityID && id) {
          return activity;
        }
      }
    }, [], SEND_TIMEOUT));

    yield observeOnce(directLine.postActivity(activity));

    const echoBack = yield join(expectEchoBack);

    yield put({ type: POST_ACTIVITY_FULFILLED, meta, payload: { activity: echoBack } });
  } catch (err) {
    yield put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: err });
  } finally {
    if (yield cancelled()) {
      yield put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: new Error('cancelled') });
    }
  }
}
