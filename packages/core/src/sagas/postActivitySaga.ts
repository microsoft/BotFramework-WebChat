import { all, call, cancelled, put, race, select, take, takeEvery } from 'redux-saga/effects';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import {
  POST_ACTIVITY,
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../actions/postActivity';
import dateToLocaleISOString from '../utils/dateToLocaleISOString';
import deleteKey from '../utils/deleteKey';
import languageSelector from '../selectors/language';
import observeOnce from './effects/observeOnce';
import sendTimeoutSelector from '../selectors/sendTimeout';
import sleep from '../utils/sleep';
import uniqueID from '../utils/uniqueID';
import whileConnected from './effects/whileConnected';
import type { DirectLineActivity } from '../types/external/DirectLineActivity';
import type { DirectLineJSBotConnection } from '../types/external/DirectLineJSBotConnection';
import type { IncomingActivityAction } from '../actions/incomingActivity';
import type {
  PostActivityAction,
  PostActivityFulfilledAction,
  PostActivityPendingAction,
  PostActivityRejectedAction
} from '../actions/postActivity';
import type { WebChatActivity } from '../types/WebChatActivity';

function* postActivity(
  directLine: DirectLineJSBotConnection,
  userID: string,
  username: string,
  numActivitiesPosted: number,
  { meta: { method }, payload: { activity } }: PostActivityAction
) {
  const attachments = (activity.type === 'message' && activity.attachments) || [];
  const clientActivityID = uniqueID();
  const locale = yield select(languageSelector);
  const localTimeZone =
    typeof window.Intl === 'undefined' ? undefined : new Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();

  activity = {
    ...deleteKey(activity, 'id'),
    attachments:
      attachments &&
      attachments.map(({ contentType, contentUrl, name, thumbnailUrl }) => ({
        contentType,
        contentUrl,
        name,
        thumbnailUrl
      })),
    channelData: {
      ...deleteKey(activity.channelData, 'state'),
      clientActivityID
    },
    channelId: 'webchat',
    from: {
      id: userID,
      name: username,
      role: 'user'
    },
    locale,
    localTimestamp: dateToLocaleISOString(now),
    localTimezone: localTimeZone
  };

  if (!numActivitiesPosted) {
    activity.entities = [
      ...(activity.entities || []),
      {
        // TODO: [P4] Currently in v3, we send the capabilities although the client might not actually have them
        //       We need to understand why we need to send these, and only send capabilities the client have
        requiresBotState: true,
        supportsListening: true,
        supportsTts: true,
        type: 'ClientCapabilities'
      }
    ];
  }

  const meta: { clientActivityID: string; method: string } = { clientActivityID, method };

  yield put({ type: POST_ACTIVITY_PENDING, meta, payload: { activity } } as PostActivityPendingAction);

  try {
    // Quirks: We might receive INCOMING_ACTIVITY before the postActivity call completed
    //         So, we setup expectation first, then postActivity afterward

    const echoBackCall = call(function* () {
      for (;;) {
        const {
          payload: { activity }
        }: IncomingActivityAction = yield take(INCOMING_ACTIVITY);
        if (activity.channelData?.clientActivityID === clientActivityID && activity.id) {
          return activity;
        }
      }
    });

    // Timeout could be due to either:
    // - Post activity call may take too long time to complete
    //   - Direct Line service only respond on HTTP after bot respond to Direct Line
    // - Activity may take too long time to echo back

    const sendTimeout: number = yield select(sendTimeoutSelector);

    const {
      send: { echoBack }
    }: { send: { echoBack: WebChatActivity } } = yield race({
      send: all({
        echoBack: echoBackCall,
        postActivity: observeOnce(directLine.postActivity(activity as DirectLineActivity))
      }),
      timeout: call(() => sleep(sendTimeout).then(() => Promise.reject(new Error('timeout'))))
    });

    yield put({ type: POST_ACTIVITY_FULFILLED, meta, payload: { activity: echoBack } } as PostActivityFulfilledAction);
  } catch (err) {
    console.error('botframework-webchat: Failed to post activity to chat adapter.', err);

    yield put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: err } as PostActivityRejectedAction);
  } finally {
    if (yield cancelled()) {
      yield put({
        type: POST_ACTIVITY_REJECTED,
        error: true,
        meta,
        payload: new Error('cancelled')
      } as PostActivityRejectedAction);
    }
  }
}

export default function* postActivitySaga() {
  yield whileConnected(function* postActivityWhileConnected({
    directLine,
    userID,
    username
  }: {
    directLine: DirectLineJSBotConnection;
    userID: string;
    username: string;
  }) {
    let numActivitiesPosted = 0;

    yield takeEvery(POST_ACTIVITY, function* postActivityWrapper(action: PostActivityAction) {
      yield* postActivity(directLine, userID, username, numActivitiesPosted++, action);
    });
  });
}
