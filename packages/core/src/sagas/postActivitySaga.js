import {
  all,
  call,
  cancelled,
  put,
  race,
  select,
  take,
  takeEvery
} from 'redux-saga/effects';

import sleep from '../utils/sleep';

import observeOnce from './effects/observeOnce';
import whileConnected from './effects/whileConnected';

import deleteKey from '../utils/deleteKey';
import getTimestamp from '../utils/getTimestamp';
import uniqueID from '../utils/uniqueID';

import {
  POST_ACTIVITY,
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../actions/postActivity';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';

export default function* () {
  yield whileConnected(function* (directLine, userID) {
    let numActivitiesPosted = 0;

    yield takeEvery(POST_ACTIVITY, function* (action) {
      yield* postActivitySaga(action, directLine, userID, numActivitiesPosted++);
    });
  });
}

function* postActivitySaga({ payload: { activity } }, directLine, userID, numActivitiesPosted) {
  const locale = yield select(({ language }) => language);
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
    channelId: 'webchat',
    from: {
      id: userID,
      role: 'user'
    },
    locale,
    timestamp: getTimestamp()
  };

  if (!numActivitiesPosted++) {
    activity.entities = [...activity.entities || [], {
      // TODO: [P4] Currently in v3, we send the capabilities although the client might not actually have them
      //       We need to understand why we need to send these, and only send capabilities the client have
      requiresBotState: true,
      supportsListening: true,
      supportsTts: true,
      type: 'ClientCapabilities'
    }];
  }

  const meta = { clientActivityID };

  yield put({ type: POST_ACTIVITY_PENDING, payload: { activity }, meta });

  try {
    // Quirks: We might receive INCOMING_ACTIVITY before the postActivity call completed
    //         So, we setup expectation first, then postActivity afterward

    const echoBackCall = call(function* () {
      for (;;) {
        const { payload: { activity } } = yield take(INCOMING_ACTIVITY);
        const { channelData = {}, id } = activity;

        if (channelData.clientActivityID === clientActivityID && id) {
          return activity;
        }
      }
    });

    // Timeout could be due to either:
    // - Post activity call may take too long time to complete
    //   - Direct Line service only respond on HTTP after bot respond to Direct Line
    // - Activity may take too long time to echo back

    const sendTimeout = yield select(({ sendTimeout }) => sendTimeout);

    const { send: { echoBack } } = yield race({
      send: all({
        echoBack: echoBackCall,
        postActivity: observeOnce(directLine.postActivity(activity))
      }),
      timeout: call(() => sleep(sendTimeout).then(() => Promise.reject(new Error('timeout'))))
    });

    yield put({ type: POST_ACTIVITY_FULFILLED, meta, payload: { activity: echoBack } });
  } catch (err) {
    yield put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: err });
  } finally {
    if (yield cancelled()) {
      yield put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: new Error('cancelled') });
    }
  }
}
