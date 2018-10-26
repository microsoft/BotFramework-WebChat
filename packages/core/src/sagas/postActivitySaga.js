import {
  cancelled,
  fork,
  join,
  put,
  select,
  take
} from 'redux-saga/effects';

import callWithin from './effects/callWithin';
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

const SEND_TIMEOUT = 5000;

export default function* () {
  yield whileConnected(function* (directLine, userID) {
    for (let numActivitiesPosted = 0;; numActivitiesPosted++) {
      const action = yield take(POST_ACTIVITY);

      yield fork(postActivity, directLine, userID, numActivitiesPosted, action);
    }
  });
}

function* postActivity(directLine, userID, numActivitiesPosted, { payload: { activity } }) {
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

  if (!numActivitiesPosted) {
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

    const expectEchoBack = yield fork(() => callWithin(function* () {
      for (;;) {
        const { payload: { activity } } = yield take(INCOMING_ACTIVITY);
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
