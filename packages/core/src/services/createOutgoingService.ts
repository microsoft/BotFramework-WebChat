import type { ActivitiesStore } from '@msinternal/botframework-webchat-core-activities';

import type { DirectLineActivity } from '../types/external/DirectLineActivity';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { WebChatOutgoingActivity } from '../types/internal/WebChatOutgoingActivity';
import type { WebChatActivity } from '../types/WebChatActivity';
import uniqueID from '../utils/uniqueID';
import type { ConnectionService, ConnectionSession } from './createConnectionService';
import type { IncomingService, SuggestedActionsEmitter } from './createIncomingService';
import createOutgoingActivity from './private/createOutgoingActivity';
import createVoiceActivity from './private/createVoiceActivity';
import throwIfUndefined from './private/throwIfUndefined';
import createSagaQueue, { type SagaQueue } from './private/createSagaQueue';
import {
  eventToActivity,
  filesToActivity,
  hasEventToSend,
  hasFilesToSend,
  hasMessageToSend,
  messageBackToActivity,
  messageToActivity,
  postBackToActivity,
  type SendEventPayload,
  type SendFilesPayload,
  type SendMessageBackPayload,
  type SendMessagePayload,
  type SendPostBackPayload
} from './private/sendPayloadToActivity';

// After 5 minutes, the post is permanently undeliverable. It must be equal to or larger than the send timeout.
const HARD_SEND_TIMEOUT = 300_000;
const DEFAULT_SEND_TIMEOUT = 20_000;

type OutgoingService = {
  /**
   * Runs `fn`; what the sagas would do after the current action (posting, clearing the suggested actions after a
   * message, and "send failed" when `postActivity()` throws) is done when the outermost `batch()` returns.
   */
  readonly batch: <T>(fn: () => T) => T;
  /** Posts the typing activity, as `EMIT_TYPING_INDICATOR`. */
  readonly emitTypingIndicator: () => void;
  /** The locale of the activities posted, as the `language` of the Redux store. */
  readonly getLocale: () => string;
  /** Posts the activity, as `POST_ACTIVITY`: dropped while offline. */
  readonly postActivity: (activity: WebChatActivity, method?: string) => void;
  /**
   * Posts a voice activity of speech-to-speech, as `VOICE_POST_ACTIVITY`: while online, fire and forget (not in the
   * transcript, no echo, no timeout, no client capabilities, not counted as a post).
   */
  readonly postVoiceActivity: (activity: WebChatActivity) => void;
  readonly sendEvent: (payload: SendEventPayload) => void;
  readonly sendFiles: (payload: SendFilesPayload) => void;
  readonly sendMessage: (payload: SendMessagePayload) => void;
  readonly sendMessageBack: (payload: SendMessageBackPayload) => void;
  readonly sendPostBack: (payload: SendPostBackPayload) => void;
  /** The locale of the activities posted, as `SET_LANGUAGE` (`en-US` until set). */
  readonly setLocale: (locale: string) => void;
  /** After this time without echo or return, the activity is shown as "send failed", as `SET_SEND_TIMEOUT`. */
  readonly setSendTimeout: (sendTimeout: number) => void;
  /**
   * Runs `fn` if online, as a saga reacting to an action: an error stops everything (status "sagaerror"). For the raw
   * actions of card action middleware, read as the sagas read them.
   */
  readonly whileOnline: (fn: () => void) => void;
};

type Post = {
  clientActivityID: string;
  hardTimer?: ReturnType<GlobalScopePonyfill['setTimeout']> | undefined;
  impedeTimer?: ReturnType<GlobalScopePonyfill['setTimeout']> | undefined;
  /** `true` once the post returned or completed, or failed. */
  settled: boolean;
  subscription?: { unsubscribe(): void } | undefined;
};

type Session = ConnectionSession & {
  readonly inFlight: Set<Post>;
  numActivitiesPosted: number;
  stopped: boolean;
  /** The voice posts not returned yet. */
  readonly voicePosts: Set<VoicePost>;
};

type VoicePost = {
  /** `true` once the post returned, completed or failed. */
  settled: boolean;
  subscription?: { unsubscribe(): void } | undefined;
};

/**
 * The outgoing activities without Redux: the same observable behaviour as `postActivitySaga`, the
 * `send*ToPostActivitySaga`, `emitTypingIndicatorToPostActivitySaga`, `clearSuggestedActionsOnPostActivitySaga` and
 * `postVoiceActivitySaga`, including the calls made to Direct Line and their order.
 *
 * While online, a post: adds the activity as "sending", calls `postActivity()` of Direct Line, then waits for both its
 * return and the echo (an incoming activity with the same client activity ID and an ID): "sent". After the send timeout
 * (20 s by default), "send failed" in `channelData.state` only; after 5 minutes, "send failed". An error of Direct Line
 * is "send failed" too. Going offline, the posts in flight are "send failed".
 *
 * A voice post (speech-to-speech) only calls `postActivity()` of Direct Line, while online: an error is logged.
 *
 * Quirks kept on purpose, as in Redux mode (to fix in both modes later):
 *
 * - posts while offline (also while reconnecting) are dropped, without "send failed";
 * - after the send timeout, only `channelData.state` is "send failed", and an echo later still makes it "sent";
 * - the first post of each online period (any type, the typing activity too) carries `ClientCapabilities`;
 * - a post cancelled when going offline is "send failed" without an error in the console;
 * - when "sent" cannot be written, the post is reported as failed; when "sending" cannot be written, everything stops;
 * - the typing activity is posted as any other (sending, echo, timeouts);
 * - the operations other than `sendMessage()` post with the method "keyboard";
 * - voice posts: dropped while offline, without an error; going offline unsubscribes them, without an error; they are
 *   not the first post (no `ClientCapabilities` on them, and the next post still carries it);
 * - a locale or send timeout set to `undefined` throws to the caller, and nothing changes (the reducers' check).
 *
 * Not kept: the send timers are cleared when the post completes (the saga left them running, unused).
 */
export default function createOutgoingService({
  activitiesStore,
  connection,
  incoming,
  ponyfill,
  queue: { batch, handleAction, later, onAction } = createSagaQueue(),
  suggestedActions
}: {
  readonly activitiesStore: Pick<
    ActivitiesStore,
    'postActivityFulfilled' | 'postActivityImpeded' | 'postActivityPending' | 'postActivityRejected'
  >;
  readonly connection: Pick<ConnectionService, 'fail' | 'onOnline'>;
  readonly incoming: Pick<IncomingService, 'onActivity'>;
  readonly ponyfill: Pick<GlobalScopePonyfill, 'clearTimeout' | 'Date' | 'setTimeout'>;
  /** The order of the sagas, shared by the services. */
  readonly queue?: SagaQueue | undefined;
  readonly suggestedActions: Pick<SuggestedActionsEmitter, 'emit'>;
}): OutgoingService {
  const echoListeners = new Set<(activity: WebChatActivity) => void>();
  let locale = 'en-US';
  let sendTimeout = DEFAULT_SEND_TIMEOUT;
  let session: Session | undefined;

  // An error the sagas do not catch stops everything; while posting, it is thrown inside an action.
  const fail = (error: unknown) => connection.fail(error, { insideWrite: true });

  const stopTimers = (post: Post) => {
    post.impedeTimer && ponyfill.clearTimeout(post.impedeTimer);
    post.hardTimer && ponyfill.clearTimeout(post.hardTimer);
    post.impedeTimer = post.hardTimer = undefined;
  };

  // The post is not in flight anymore: no echo, no timer, no subscription.
  const settle = (current: Session, post: Post, echoListener: (activity: WebChatActivity) => void) => {
    current.inFlight.delete(post);
    echoListeners.delete(echoListener);
    stopTimers(post);
  };

  const reject = (clientActivityID: string, error: unknown) => {
    console.error('botframework-webchat: Failed to post activity to chat adapter.', error);

    try {
      activitiesStore.postActivityRejected(clientActivityID);
    } catch (rejectError) {
      fail(rejectError);
    }
  };

  const post = (current: Session, activity: WebChatActivity, method: string) => {
    const isFirstPost = !current.numActivitiesPosted++;

    let outgoingActivity: WebChatOutgoingActivity;
    let clientActivityID: string;

    try {
      // `POST_ACTIVITY`: the post saga builds the activity, the typing indicator saga waits again.
      handleAction({ activity, type: 'POST_ACTIVITY' });

      clientActivityID = uniqueID();
      outgoingActivity = createOutgoingActivity({
        activity,
        clientActivityID,
        isFirstPost,
        locale,
        now: new ponyfill.Date(),
        userID: current.userID,
        username: current.username
      });
    } catch (error) {
      // As the saga: an error before writing "sending" stops everything; this saga stops first.
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      stopSession(current, false);
      fail(error);

      return;
    }

    // Then it puts "sending": after the current action.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    later(() => postPending(current, outgoingActivity, clientActivityID, method));
  };

  // `POST_ACTIVITY_PENDING`: "sending", the sagas waiting for it (clearing the suggested actions, speech), then the post.
  const postPending = (
    current: Session,
    outgoingActivity: WebChatOutgoingActivity,
    clientActivityID: string,
    method: string
  ) => {
    try {
      activitiesStore.postActivityPending(outgoingActivity as WebChatActivity);
    } catch (error) {
      // As the saga: an error while writing "sending" stops everything; this saga stops first.
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      stopSession(current, false);
      fail(error);

      return;
    }

    const record: Post = { clientActivityID, settled: false };
    let echo: WebChatActivity | undefined;
    // `true` once `postActivity()` returned (after the unsubscription, as the saga resumes).
    let returned = false;

    // The post is complete: both returned and echoed back.
    const fulfill = () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      settle(current, record, echoListener);

      try {
        activitiesStore.postActivityFulfilled(clientActivityID, echo);
      } catch (error) {
        // As the saga: "sent" is written inside its try.
        reject(clientActivityID, error);
      }
    };

    const echoListener = (incomingActivity: WebChatActivity) => {
      if (incomingActivity.channelData?.clientActivityID === clientActivityID && incomingActivity.id) {
        echoListeners.delete(echoListener);
        echo = incomingActivity;
        returned && fulfill();
      }
    };

    try {
      handleAction({ activity: outgoingActivity, method, type: 'POST_ACTIVITY_PENDING' });
    } catch (error) {
      fail(error);

      return;
    }

    // Gone offline meanwhile: the saga was cancelled.
    if (current.stopped) {
      return;
    }

    current.inFlight.add(record);

    // Echoes may come before `postActivity()` returns: listen first.
    echoListeners.add(echoListener);

    const settleWithError = (error: unknown) => {
      settle(current, record, echoListener);
      reject(clientActivityID, error);
    };

    // As `observeOnce()`: the first value or the completion is the return, an error fails; then it unsubscribes, after
    // the current work (the saga resumes from a promise).
    const handleReturn = (error?: { readonly error: unknown }) => {
      if (record.settled || !current.inFlight.has(record)) {
        return;
      }

      record.settled = true;

      Promise.resolve().then(() => {
        if (!current.inFlight.has(record)) {
          return;
        }

        record.subscription?.unsubscribe();
        record.subscription = undefined;
        returned = true;

        if (error) {
          settleWithError(error.error);
        } else if (echo) {
          fulfill();
        }
      });
    };

    try {
      record.subscription = current.directLine.postActivity(outgoingActivity as DirectLineActivity).subscribe({
        complete: () => handleReturn(),
        error: (error: unknown) => handleReturn({ error }),
        next: () => handleReturn()
      });
    } catch (error) {
      // `postActivity()` throws: "send failed", after this action.
      settle(current, record, echoListener);
      console.error('botframework-webchat: Failed to post activity to chat adapter.', error);
      later(() => {
        try {
          activitiesStore.postActivityRejected(clientActivityID);
        } catch (rejectError) {
          fail(rejectError);
        }
      });

      return;
    }

    // The send timeout, then the hard timeout; read when posting. As the saga's `sleep()`, each resumes a turn after its
    // timer fires: the hard timeout starts once the send timeout is handled, not within the same `tick()` of a fake clock.
    const timeout = sendTimeout;

    const resumeIfInFlight = (fn: () => void) => () =>
      Promise.resolve().then(() => current.inFlight.has(record) && fn());

    record.impedeTimer = ponyfill.setTimeout(
      resumeIfInFlight(() => {
        record.impedeTimer = undefined;

        try {
          // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`, see #4362.
          activitiesStore.postActivityImpeded(clientActivityID);
        } catch (error) {
          settle(current, record, echoListener);
          reject(clientActivityID, error);

          return;
        }

        record.hardTimer = ponyfill.setTimeout(
          resumeIfInFlight(() => {
            record.hardTimer = undefined;
            record.subscription?.unsubscribe();
            record.subscription = undefined;
            settleWithError(
              echo
                ? new Error('timed out while waiting for postActivity to return any values')
                : new Error('timed out while waiting for outgoing message to echo back')
            );
          }),
          Math.max(HARD_SEND_TIMEOUT - timeout, 0)
        );
      }),
      Math.max(timeout, 0)
    );
  };

  // Going offline: the posts in flight are unsubscribed, then "send failed", without an error.
  const stopSession = (current: Session, rejectInFlight: boolean) => {
    const posts = Array.from(current.inFlight);

    if (!current.stopped) {
      current.stopped = true;

      session === current && (session = undefined);

      for (const record of posts) {
        stopTimers(record);
        record.subscription?.unsubscribe();
        record.subscription = undefined;
      }

      // Then the voice posts in flight (postVoiceActivitySaga is forked after postActivitySaga), without an error.
      for (const voicePost of Array.from(current.voicePosts)) {
        current.voicePosts.delete(voicePost);
        voicePost.subscription?.unsubscribe();
      }

      // The echo listeners of this session.
      echoListeners.clear();
    }

    if (rejectInFlight) {
      current.inFlight.clear();

      for (const { clientActivityID } of posts) {
        try {
          activitiesStore.postActivityRejected(clientActivityID);
        } catch (error) {
          fail(error);
        }
      }
    }
  };

  connection.onOnline((online: ConnectionSession) => {
    const current: Session = {
      ...online,
      inFlight: new Set(),
      numActivitiesPosted: 0,
      stopped: false,
      voicePosts: new Set()
    };

    session = current;

    // clearSuggestedActionsOnPostActivitySaga: a message pending clears the suggested actions, after the action.
    const stopClearing = onAction(
      action => action.type === 'POST_ACTIVITY_PENDING' && action.activity.type === 'message',
      () =>
        later(() => {
          try {
            suggestedActions.emit(Object.freeze([]), undefined);
          } catch (error) {
            fail(error);
          }
        })
    );

    return () => {
      stopClearing();
      stopSession(current, true);
    };
  });

  incoming.onActivity(activity => {
    for (const listener of Array.from(echoListeners)) {
      listener(activity);
    }
  });

  const postActivity = (activity: WebChatActivity, method = 'keyboard') =>
    batch(() => {
      const current = session;

      current && post(current, activity, method);
    });

  // A saga puts `POST_ACTIVITY`: posted after the current action, if still online.
  const postLater = (activity: WebChatActivity, method?: string) => later(() => postActivity(activity, method));

  // The senders: while online, the payload to the activity, then post it; an error stops everything, as in the sagas.
  const whileOnline = (fn: () => void) =>
    batch(() => {
      if (session) {
        try {
          fn();
        } catch (error) {
          fail(error);
        }
      }
    });

  const failVoicePost = (error: unknown) =>
    console.error('botframework-webchat: Failed to post voice activity to chat adapter.', error);

  // postVoiceActivitySaga: while online, posts and waits for the first value, the completion or the error, as
  // `observeOnce()`: it unsubscribes a turn later, then logs the error, if any. Going offline unsubscribes it, silently.
  const postVoiceActivity = (activity: WebChatActivity) => {
    const current = session;

    if (!current) {
      return;
    }

    const voicePost: VoicePost = { settled: false };

    const settle = (error?: { readonly error: unknown }) => {
      if (!voicePost.settled) {
        voicePost.settled = true;

        Promise.resolve().then(() => {
          if (current.voicePosts.delete(voicePost)) {
            voicePost.subscription?.unsubscribe();
            error && failVoicePost(error.error);
          }
        });
      }
    };

    try {
      const voiceActivity = createVoiceActivity({
        activity,
        locale,
        now: new ponyfill.Date(),
        userID: current.userID,
        username: current.username
      });

      current.voicePosts.add(voicePost);

      voicePost.subscription = current.directLine.postActivity(voiceActivity as DirectLineActivity).subscribe({
        complete: () => settle(),
        error: (error: unknown) => settle({ error }),
        next: () => settle()
      });
    } catch (error) {
      current.voicePosts.delete(voicePost);
      failVoicePost(error);
    }
  };

  return Object.freeze({
    batch,
    // emitTypingIndicatorToPostActivitySaga: while online, puts the typing activity.
    emitTypingIndicator: () => whileOnline(() => postLater({ type: 'typing' } as WebChatActivity)),
    getLocale: () => locale,
    postActivity,
    postVoiceActivity,
    sendEvent: (payload: SendEventPayload) =>
      whileOnline(() => hasEventToSend(payload) && postLater(eventToActivity(payload))),
    sendFiles: (payload: SendFilesPayload) =>
      whileOnline(() => hasFilesToSend(payload) && postLater(filesToActivity(payload))),
    sendMessage: (payload: SendMessagePayload) =>
      whileOnline(() => hasMessageToSend(payload) && postLater(messageToActivity(payload), payload.method)),
    sendMessageBack: (payload: SendMessageBackPayload) => whileOnline(() => postLater(messageBackToActivity(payload))),
    sendPostBack: (payload: SendPostBackPayload) => whileOnline(() => postLater(postBackToActivity(payload))),
    // As the reducers: `undefined` throws to the caller, and nothing changes.
    setLocale: (value: string) => {
      throwIfUndefined(value, 'WEB_CHAT/SET_LANGUAGE', 'language');
      locale = value;
    },
    setSendTimeout: (value: number) => {
      throwIfUndefined(value, 'WEB_CHAT/SET_SEND_TIMEOUT', 'sendTimeout');
      sendTimeout = value;
    },
    whileOnline
  });
}

export type { OutgoingService };
