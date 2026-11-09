import {
  hasBotActivity,
  hasReplyTarget,
  ReplyToIdHold,
  type ActivitiesStore
} from '@msinternal/botframework-webchat-core-activities';

import type { DirectLineCardAction } from '../types/external/DirectLineCardAction';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { WebChatActivity } from '../types/WebChatActivity';
import isVoiceActivity from '../utils/voiceActivity/isVoiceActivity';
import isVoiceTranscriptActivity from '../utils/voiceActivity/isVoiceTranscriptActivity';
import type { ConnectionService, ConnectionSession } from './createConnectionService';
import createEmitter, { type Emitter } from './private/createEmitter';
import patchIncomingActivity from './private/patchIncomingActivity';
import pickSuggestedActions from './private/pickSuggestedActions';
import subscribeQueue from './private/subscribeQueue';

type ActivityListener = (activity: WebChatActivity) => void;

type SuggestedActionsListener = (
  suggestedActions: readonly DirectLineCardAction[],
  originActivity: WebChatActivity | undefined
) => void;

/** The suggested actions set or cleared, by the incoming activities and by the outgoing ones. */
type SuggestedActionsEmitter = Emitter<Parameters<SuggestedActionsListener>>;

/** Speech-to-speech, for the voice activities that are not transcripts. Without it, they are dropped (not recording). */
type IncomingVoicePort = {
  readonly getVoiceHandlers: () => Iterable<{ queueAudio(base64: string): void; stopAllAudio(): void }>;
  /** `idle` when not recording. */
  readonly getVoiceState: () => string;
  readonly setVoiceState: (voiceState: 'processing' | 'user_speaking') => void;
};

type IncomingService = {
  /** Calls the listener with each activity once it is in the activities store, in order. */
  readonly onActivity: (listener: ActivityListener) => () => void;
  /**
   * Calls the listener with the suggested actions of the last message, after each activity received, if that message is
   * from the bot. No actions and no origin activity clears them.
   */
  readonly onSuggestedActions: (listener: SuggestedActionsListener) => () => void;
};

const EMPTY_ARRAY: readonly DirectLineCardAction[] = Object.freeze([]);

/**
 * The activities from Direct Line to the activities store, without Redux: the same observable behaviour as
 * `observeActivitySaga` and `queueIncomingActivitySaga`.
 *
 * While the connection is online: subscribes to `activity$`, patches each activity (`patchIncomingActivity()`), holds
 * the replies to an activity not in the transcript yet (`ReplyToIdHold`), then, one at a time, receives it in the
 * activities store, calls the activity listeners, and picks the suggested actions. When the connection goes offline,
 * held and queued activities are dropped.
 *
 * An error stops everything, as a saga error does in Redux mode (`connection.fail()`).
 */
export default function createIncomingService({
  activitiesStore,
  connection,
  ponyfill,
  suggestedActions: suggestedActionsEmitter = createEmitter(),
  voice
}: {
  readonly activitiesStore: Pick<ActivitiesStore, 'getSnapshot' | 'receiveActivity'>;
  readonly connection: Pick<ConnectionService, 'fail' | 'onOnline'>;
  readonly ponyfill: Pick<GlobalScopePonyfill, 'clearTimeout' | 'setTimeout'>;
  /** Where the suggested actions are emitted, shared with the services that clear them. */
  readonly suggestedActions?: SuggestedActionsEmitter | undefined;
  readonly voice?: IncomingVoicePort | undefined;
}): IncomingService {
  const activityEmitter = createEmitter<Parameters<ActivityListener>>();

  // The voice activities, as observeActivitySaga: only while recording.
  const handleVoiceActivity = (activity: WebChatActivity & { name: string; value: any }) => {
    if (!voice || voice.getVoiceState() === 'idle') {
      return;
    }

    switch (activity.name) {
      case 'media.chunk': {
        const audioContent = activity?.value?.content;

        if (audioContent) {
          for (const handler of voice.getVoiceHandlers()) {
            handler.queueAudio(audioContent);
          }
        }

        break;
      }

      case 'request.update': {
        const state = activity?.value?.state;

        if (state === 'detected') {
          for (const handler of voice.getVoiceHandlers()) {
            handler.stopAllAudio();
          }

          voice.setVoiceState('user_speaking');
        } else if (state === 'processing') {
          voice.setVoiceState('processing');
        }

        break;
      }

      default:
        break;
    }
  };

  const start = ({ directLine, userID }: ConnectionSession): (() => void) => {
    const releaseQueue: WebChatActivity[] = [];
    let releasing = false;
    let stopped = false;

    // queueIncomingActivitySaga: receives the activity, then picks the suggested actions, one activity at a time.
    const receive = (activity: WebChatActivity) => {
      releaseQueue.push(activity);

      if (releasing) {
        return;
      }

      releasing = true;

      try {
        // `stopped` changes when the connection goes offline during a listener.
        // eslint-disable-next-line no-unmodified-loop-condition
        while (!stopped && releaseQueue.length) {
          const next = releaseQueue.shift();

          activitiesStore.receiveActivity(next);
          activityEmitter.emit(next);

          // Every activity that reaches the transcript can release replies waiting for it.
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          hold.recheck();

          const suggestedActions = pickSuggestedActions(activitiesStore.getSnapshot().sortedActivities, userID);

          if (suggestedActions) {
            const { originActivity, suggestedActions: actions = EMPTY_ARRAY } = suggestedActions;

            suggestedActionsEmitter.emit(actions, originActivity);
          }
        }
      } catch (error) {
        // As the saga: an error while receiving (a "put") stops this part first, then everything.
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        stopQueue();
        connection.fail(error, { insideWrite: true });
      } finally {
        releasing = false;
      }
    };

    // This is for resolving an accessibility issue: if the incoming activity has "replyToId", hold it until the
    // activity replied to is in the transcript, then release this one.
    const hold = new ReplyToIdHold<WebChatActivity>({
      clock:
        ponyfill.clearTimeout && ponyfill.setTimeout
          ? { clearTimeout: ponyfill.clearTimeout, setTimeout: ponyfill.setTimeout }
          : undefined,
      hasReplyTarget: replyToId => hasReplyTarget(activitiesStore.getSnapshot(), replyToId),
      // To speed up the first activity render time, we do not delay the first activity from the bot.
      isHoldEnabled: () => hasBotActivity(activitiesStore.getSnapshot()),
      release: receive
    });

    const stopQueue = () => {
      if (!stopped) {
        stopped = true;
        releaseQueue.splice(0);
        hold.close();
      }
    };

    // observeActivitySaga
    const activitySubscription = subscribeQueue(directLine.activity$, (activity: WebChatActivity) => {
      if (stopped) {
        return;
      }

      let patched: WebChatActivity | undefined;

      try {
        if (isVoiceActivity(activity) && !isVoiceTranscriptActivity(activity)) {
          handleVoiceActivity(activity);

          return;
        }

        patched = patchIncomingActivity(activity, userID);
      } catch (error) {
        // As the saga: an error while observing stops this part first, then everything.
        activitySubscription.unsubscribe();
        connection.fail(error);

        return;
      }

      hold.push(patched);
    });

    return () => {
      activitySubscription.unsubscribe();
      stopQueue();
    };
  };

  connection.onOnline(start);

  return Object.freeze({
    onActivity: activityEmitter.subscribe,
    onSuggestedActions: suggestedActionsEmitter.subscribe
  });
}

export type { ActivityListener, IncomingService, IncomingVoicePort, SuggestedActionsEmitter, SuggestedActionsListener };
