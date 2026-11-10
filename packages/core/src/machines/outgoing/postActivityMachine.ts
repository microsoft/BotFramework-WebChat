import { INCOMING_ACTIVITY } from '../../actions/incomingActivity';
import {
  POST_ACTIVITY,
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_IMPEDED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../../actions/postActivity';
import languageSelector from '../../selectors/language';
import sendTimeoutSelector from '../../selectors/sendTimeout';
import createOutgoingActivity from '../../services/private/createOutgoingActivity';
import uniqueID from '../../utils/uniqueID';
import { is } from '../private/effects';
import type { Machine, MachineAction, OnlineSession, Scope } from '../types';

// After 5 minutes, the outgoing activity is permanently undeliverable: no more waiting for its echo.
// This value must be equals to or larger than the user-defined `styleOptions.sendTimeout`.
const HARD_SEND_TIMEOUT = 300000;

function postActivity(
  worker: Scope,
  { directLine, userID, username }: OnlineSession,
  numActivitiesPosted: number,
  { meta: { method }, payload: { activity } }: MachineAction
): void {
  const clientActivityID = uniqueID();
  const locale = worker.select(languageSelector);
  const now = new worker.ponyfill.Date();
  const outgoingActivity = createOutgoingActivity({
    activity,
    clientActivityID,
    isFirstPost: !numActivitiesPosted,
    locale,
    now,
    userID,
    username
  });
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

    online.on(is(POST_ACTIVITY), (action, worker) => postActivity(worker, session, numActivitiesPosted++, action));
  });

export default postActivityMachine;
