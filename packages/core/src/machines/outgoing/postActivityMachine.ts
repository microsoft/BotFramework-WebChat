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
    let echoed: boolean | undefined;
    let stopRace = () => undefined;

    // The `catch`: "send failed".
    const reject = (error: unknown) => {
      stopRace();
      console.error('botframework-webchat: Failed to post activity to chat adapter.', error);
      worker.put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: error });
    };

    // What throws inside the `try` is caught.
    const attempt =
      <T extends unknown[]>(fn: (...args: T) => void) =>
      (...args: T) => {
        try {
          fn(...args);
        } catch (error) {
          reject(error);
        }
      };

    worker.finally(
      cancelled =>
        cancelled && worker.put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: new Error('cancelled') })
    );

    attempt(() => {
      // The echo may come before `postActivity()` returns: the race waits for both, then "sent".
      const sendTimeout: number = worker.select(sendTimeoutSelector);
      const posting = directLine.postActivity(outgoingActivity);
      let echoBack: any;
      let returned = false;

      const sent = () => {
        if (echoed && returned) {
          stopRace();
          worker.put({ type: POST_ACTIVITY_FULFILLED, meta, payload: { activity: echoBack } }, undefined, reject);
        }
      };

      let stopTakingEcho: () => void;

      const takeEcho = () => {
        stopTakingEcho = worker.take(
          is(INCOMING_ACTIVITY),
          attempt(({ payload: { activity } }) => {
            if (activity.channelData?.clientActivityID === clientActivityID && activity.id) {
              echoed = true;
              echoBack = activity;
              sent();
            } else {
              takeEcho();
            }
          })
        );
      };

      takeEcho();

      const stopObserving = worker.observeOnce(
        posting,
        attempt(() => {
          returned = true;
          sent();
        }),
        reject
      );

      // The timeout: the post may take too long to return (Direct Line returns after the bot did), or to echo back.
      let stopHardTimeout = () => undefined;

      const stopTimeout = worker.sleep(
        sendTimeout,
        attempt(() =>
          // For backward compatibility, "send failed" in `channelData.state` (deprecated in favor of
          // `channelData['webchat:send-status']`, #4362).
          worker.put(
            { type: POST_ACTIVITY_IMPEDED, meta, payload: { activity: outgoingActivity } },
            attempt(() => {
              stopHardTimeout = worker.sleep(
                HARD_SEND_TIMEOUT - sendTimeout,
                attempt(() => {
                  throw !echoed
                    ? new Error('timed out while waiting for outgoing message to echo back')
                    : new Error('timed out while waiting for postActivity to return any values');
                })
              );
            }),
            reject
          )
        )
      );

      stopRace = () => {
        stopTakingEcho();
        stopObserving();
        stopTimeout();
        stopHardTimeout();
      };
    })();
  });
}

/**
 * `postActivitySaga`: while online, posts each `POST_ACTIVITY` to Direct Line: "sending" (`POST_ACTIVITY_PENDING`),
 * then "sent" once it returned and echoed back, or "send failed" (`POST_ACTIVITY_IMPEDED` after `sendTimeout`;
 * `POST_ACTIVITY_REJECTED` after 5 minutes, on an error, or when going offline).
 *
 * The timers are cleared when the post completes (the saga left them running).
 */
const postActivityMachine: Machine = scope =>
  scope.whileOnline((session, online) => {
    let numActivitiesPosted = 0;

    online.on(is(POST_ACTIVITY), (action, worker) =>
      postActivity(worker, session, numActivitiesPosted++, action as PostActivityAction)
    );
  });

export default postActivityMachine;
