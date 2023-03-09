import { all, call, cancelled, put, race, select, take, takeEvery } from 'redux-saga/effects';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import {
  POST_ACTIVITY,
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_IMPEDED,
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
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { IncomingActivityAction } from '../actions/incomingActivity';
import type {
  PostActivityAction,
  PostActivityFulfilledAction,
  PostActivityImpededAction,
  PostActivityPendingAction,
  PostActivityRejectedAction
} from '../actions/postActivity';
import type { WebChatActivity } from '../types/WebChatActivity';
import type { WebChatOutgoingActivity } from '../types/internal/WebChatOutgoingActivity';

// After 5 minutes, the saga will stop from listening for echo backs and consider the outgoing message as permanently undeliverable.
// This value must be equals to or larger than the user-defined `styleOptions.sendTimeout`.
const HARD_SEND_TIMEOUT = 300000;

function* postActivity(
  directLine: DirectLineJSBotConnection,
  userID: string,
  username: string,
  numActivitiesPosted: number,
  { meta: { method }, payload: { activity } }: PostActivityAction,
  ponyfill: GlobalScopePonyfill
) {
  const attachments = (activity.type === 'message' && activity.attachments) || [];
  const clientActivityID = uniqueID();
  const locale = yield select(languageSelector);
  const localTimeZone =
    typeof window.Intl === 'undefined' ? undefined : new Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new ponyfill.Date();

  // Currently, we allow untyped outgoing activity as long as the chat adapter can deliver.
  // In the future, we should warn if the outgoing activity is not matching the type.
  const outgoingActivity: WebChatOutgoingActivity = {
    ...deleteKey(activity, 'id'),
    channelData: {
      // Remove local fields that should not be send to the service.
      // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
      // Please refer to #4362 for details. Remove on or after 2024-07-31.
      ...deleteKey(activity.channelData, 'state', 'webchat:send-status'),
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
    localTimezone: localTimeZone,
    ...(activity.type === 'message'
      ? {
          attachments:
            attachments &&
            attachments.map(({ contentType, contentUrl, name, thumbnailUrl }) => ({
              contentType,
              contentUrl,
              name,
              thumbnailUrl
            })),
          text: activity.text
        }
      : activity.type === 'event'
      ? {
          name: activity.name,
          value: activity.value
        }
      : {})
  };

  if (!numActivitiesPosted) {
    outgoingActivity.entities = [
      ...(outgoingActivity.entities || []),
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

  yield put({
    type: POST_ACTIVITY_PENDING,
    meta,
    payload: { activity: outgoingActivity }
  } as PostActivityPendingAction);

  let echoed: boolean | undefined;

  try {
    // Quirks: We might receive INCOMING_ACTIVITY before the postActivity call completed
    //         So, we setup expectation first, then postActivity afterward

    const echoBackCall = call(function* () {
      for (;;) {
        const {
          payload: { activity }
        }: IncomingActivityAction = yield take(INCOMING_ACTIVITY);
        if (activity.channelData?.clientActivityID === clientActivityID && activity.id) {
          echoed = true;

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
        postActivity: observeOnce(directLine.postActivity(outgoingActivity as DirectLineActivity))
      }),
      timeout: call(function* () {
        yield call(sleep, sendTimeout, ponyfill);

        // The IMPEDED action is for backward compatibility by changing `channelData.state` to "send failed".
        // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
        // Please refer to #4362 for details. Remove on or after 2024-07-31.
        yield put({
          type: POST_ACTIVITY_IMPEDED,
          meta,
          payload: { activity: outgoingActivity }
        } as PostActivityImpededAction);

        yield call(sleep, HARD_SEND_TIMEOUT - sendTimeout, ponyfill);

        throw !echoed
          ? new Error('timed out while waiting for outgoing message to echo back')
          : new Error('timed out while waiting for postActivity to return any values');
      })
    });

    yield put({ type: POST_ACTIVITY_FULFILLED, meta, payload: { activity: echoBack } } as PostActivityFulfilledAction);
  } catch (err) {
    console.error('botframework-webchat: Failed to post activity to chat adapter.', err);

    yield put({
      type: POST_ACTIVITY_REJECTED,
      error: true,
      meta,
      payload: err
    } as PostActivityRejectedAction);
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

export default function* postActivitySaga(ponyfill: GlobalScopePonyfill) {
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
      yield* postActivity(directLine, userID, username, numActivitiesPosted++, action, ponyfill);
    });
  });
}
