import { INCOMING_ACTIVITY } from '../../actions/incomingActivity';
import {
  POST_ACTIVITY,
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_IMPEDED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED,
  type PostActivityAction
} from '../../actions/postActivity';
import languageSelector from '../../selectors/language';
import sendTimeoutSelector from '../../selectors/sendTimeout';
import { setSendStatusInOutgoingActivity } from '../../reducers/activities/sort/property/SendStatus';
import type { WebChatOutgoingActivity } from '../../types/internal/WebChatOutgoingActivity';
import type { WebChatActivity } from '../../types/WebChatActivity';
import dateToLocaleISOString from '../../utils/dateToLocaleISOString';
import deleteKey from '../../utils/deleteKey';
import uniqueID from '../../utils/uniqueID';
import { is } from '../private/effects';
import type { Machine, OnlineSession, Scope } from '../types';

// After 5 minutes, the outgoing activity is permanently undeliverable: no more waiting for its echo.
// This value must be equals to or larger than the user-defined `styleOptions.sendTimeout`.
const HARD_SEND_TIMEOUT = 300000;

type Meta = { readonly clientActivityID: string; readonly method: string };

/**
 * Posts the activity: "sent" (`POST_ACTIVITY_FULFILLED`) once it returned and echoed back, in any order. "Send failed"
 * after `sendTimeout` (`POST_ACTIVITY_IMPEDED`); rejected after 5 minutes or on an error (`POST_ACTIVITY_REJECTED`).
 */
function send(worker: Scope, directLine: any, outgoingActivity: WebChatOutgoingActivity, meta: Meta): void {
  let echoBack: WebChatActivity | undefined;
  let returned = false;
  let stopHardTimeout = () => undefined;
  let stopRace = () => undefined;
  let stopTakingEcho = () => undefined;

  const reject = (error: unknown) => {
    stopRace();
    console.error('botframework-webchat: Failed to post activity to chat adapter.', error);
    worker.put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: error });
  };

  // A step that throws rejects the post.
  const step =
    <T extends unknown[]>(fn: (...args: T) => void) =>
    (...args: T) => {
      try {
        fn(...args);
      } catch (error) {
        reject(error);
      }
    };

  const fulfillIfSent = () => {
    if (echoBack && returned) {
      stopRace();
      worker.put({ type: POST_ACTIVITY_FULFILLED, meta, payload: { activity: echoBack } }, undefined, reject);
    }
  };

  const takeEcho = () => {
    stopTakingEcho = worker.take(
      is(INCOMING_ACTIVITY),
      step(({ payload: { activity } }) => {
        if (activity.channelData?.clientActivityID === meta.clientActivityID && activity.id) {
          echoBack = activity;
          fulfillIfSent();
        } else {
          takeEcho();
        }
      })
    );
  };

  const onReturned = () => {
    returned = true;
    fulfillIfSent();
  };

  // For backward compatibility, "send failed" in `channelData.state` (deprecated in favor of
  // `channelData['webchat:send-status']`, #4362).
  const impede = (sendTimeout: number) =>
    worker.put(
      { type: POST_ACTIVITY_IMPEDED, meta, payload: { activity: outgoingActivity } },
      step(() => {
        stopHardTimeout = worker.sleep(HARD_SEND_TIMEOUT - sendTimeout, () =>
          reject(
            echoBack
              ? new Error('timed out while waiting for postActivity to return any values')
              : new Error('timed out while waiting for outgoing message to echo back')
          )
        );
      }),
      reject
    );

  try {
    // The timeout: the post may take too long to return (Direct Line returns after the bot did), or to echo back.
    const sendTimeout: number = worker.select(sendTimeoutSelector);
    const posting = directLine.postActivity(outgoingActivity);

    // The echo may come before `postActivity()` returns: it is taken first.
    takeEcho();

    const stopObserving = worker.observeOnce(posting, step(onReturned), reject);
    const stopTimeout = worker.sleep(
      sendTimeout,
      step(() => impede(sendTimeout))
    );

    stopRace = () => {
      stopTakingEcho();
      stopObserving();
      stopTimeout();
      stopHardTimeout();
    };
  } catch (error) {
    reject(error);
  }
}

function postActivity(
  worker: Scope,
  { directLine, userID, username }: OnlineSession,
  numActivitiesPosted: number,
  { meta: { method }, payload: { activity } }: PostActivityAction
): void {
  const attachments = (activity.type === 'message' && activity.attachments) || [];
  const clientActivityID = uniqueID();
  const locale = worker.select(languageSelector);
  const localTimeZone =
    typeof window.Intl === 'undefined' ? undefined : new Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new worker.ponyfill.Date();

  // Currently, we allow untyped outgoing activity as long as the chat adapter can deliver.
  // In the future, we should warn if the outgoing activity is not matching the type.
  let outgoingActivity: WebChatOutgoingActivity = {
    ...deleteKey(activity, 'id'),
    channelData: {
      // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
      // Please refer to #4362 for details. Remove on or after 2024-07-31.
      ...deleteKey(activity.channelData, 'state', 'webchat:internal:local-id', 'webchat:internal:position'),
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

  // Remove local fields that should not be send to the service.
  outgoingActivity = setSendStatusInOutgoingActivity(
    // TODO: [P1] Need to rework WebChatActivity typing.
    outgoingActivity as WebChatActivity,
    undefined
  ) as WebChatOutgoingActivity;

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

  const meta = { clientActivityID, method };

  worker.put({ type: POST_ACTIVITY_PENDING, meta, payload: { activity: outgoingActivity } }, () => {
    worker.finally(
      cancelled =>
        cancelled && worker.put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: new Error('cancelled') })
    );

    send(worker, directLine, outgoingActivity, meta);
  });
}

/**
 * While online, posts each `POST_ACTIVITY` to Direct Line: "sending" (`POST_ACTIVITY_PENDING`), then as `send()`. The
 * timers are cleared when the post completes.
 */
const postActivityMachine: Machine = scope =>
  scope.whileOnline((session, online) => {
    let numActivitiesPosted = 0;

    online.on(is(POST_ACTIVITY), (action, worker) =>
      postActivity(worker, session, numActivitiesPosted++, action as PostActivityAction)
    );
  });

export default postActivityMachine;
