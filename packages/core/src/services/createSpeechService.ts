import type { ActivitiesStore } from '@msinternal/botframework-webchat-core-activities';

import { DICTATING, IDLE, WILL_START } from '../constants/DictateState';
import speakableActivity from '../definitions/speakableActivity';
import speakingActivity from '../definitions/speakingActivity';
import type { WebChatActivity } from '../types/WebChatActivity';
import type { ConnectionService, ConnectionSession } from './createConnectionService';
import type { IncomingService } from './createIncomingService';
import createCell from './private/createCell';
import createSagaQueue, { type SagaQueue } from './private/createSagaQueue';
import nextDictateState from './private/nextDictateState';
import { hasSpeakableContent, isFromOthers } from './private/speakableIncomingActivity';
import throwIfUndefined from './private/throwIfUndefined';
import type { Notify, Source } from './types';

type SpeechActivitiesStore = Pick<ActivitiesStore, 'getSnapshot' | 'markActivity'>;

type SpeechService = {
  readonly dictateInterims: Source<readonly string[]>;
  /** `IDLE`, `WILL_START`, `STARTING`, `DICTATING` or `STOPPING` of `DictateState`. */
  readonly dictateState: Source<number>;
  /**
   * As `MARK_ACTIVITY`: sets `channelData[name]` of the activity (every mark goes through here, as it may start the
   * dictation). A reserved name throws, as the reducer does.
   */
  readonly markActivity: (activity: { readonly id: string }, name: string, value: unknown) => void;
  /** As `SET_DICTATE_INTERIMS`. */
  readonly setDictateInterims: (dictateInterims: readonly string[]) => void;
  /** As `SET_DICTATE_STATE`. */
  readonly setDictateState: (dictateState: number) => void;
  readonly shouldSpeakIncomingActivity: Source<boolean>;
  /** As `START_DICTATE`. */
  readonly startDictate: () => void;
  /** As `START_SPEAKING_ACTIVITY`. */
  readonly startSpeakingActivity: () => void;
  /** As `STOP_DICTATE`. */
  readonly stopDictate: () => void;
  /** As `STOP_SPEAKING_ACTIVITY`. */
  readonly stopSpeakingActivity: () => void;
};

const EMPTY_INTERIMS: readonly string[] = Object.freeze([]);

/**
 * Speech without Redux: dictation (state, interims) and speaking the incoming activities, as the reducers of the same
 * names and the six speech sagas, in the order of the sagas (`queue`). The Web Speech calls stay in the components.
 *
 * - An activity received from others, while online and speaking the incoming activities, is marked to be spoken (if it
 *   has something to speak); then, if it expects input, the dictation will start once everything is spoken; if it
 *   ignores input, the dictation stops.
 * - Every mark and every dictate state set (also unchanged) starts the dictation, if it will start and nothing is to be
 *   spoken anymore.
 * - Stopping the speech marks every activity to be spoken as spoken, one by one.
 * - While online: posting a message stops the dictation, unless dictating; posting while dictating, or a message by
 *   speech, starts speaking the incoming activities; typing, interims and posting a message by keyboard stop it.
 *
 * Quirks kept on purpose, as in Redux mode (to fix in both modes later):
 *
 * - offline (also reconnecting), typing, interims and posts do not stop the speech, and nothing is spoken; marks and
 *   stopping the speech still work, and start the dictation;
 * - any mark (any name) and any dictate state set (also unchanged) checks whether to start the dictation;
 * - setting the send box through the hook (not the text box, which also stops the dictation) while the dictation will
 *   start marks everything as spoken, so it starts the dictation;
 * - posting any message stops the dictation unless dictating: a message by speech while starting, a card action while
 *   the dictation will start;
 * - an activity ignoring input stops the dictation, also when not spoken;
 * - speaking the incoming activities is kept after going offline, until stopped;
 * - a message to speak with an attachment of `content: null` (without `speak` or `text`) throws: everything stops;
 * - after an error that stops everything, the operations only set the values (no saga);
 * - setting the dictate state or interims to `undefined` throws, as the reducers of Redux mode do.
 */
export default function createSpeechService({
  activitiesStore,
  connection,
  incoming,
  notify = callListeners => callListeners(),
  queue = createSagaQueue()
}: {
  readonly activitiesStore: SpeechActivitiesStore;
  readonly connection: Pick<ConnectionService, 'fail' | 'hasFailed' | 'onOnline'>;
  readonly incoming: Pick<IncomingService, 'onActivity'>;
  readonly notify?: Notify | undefined;
  /** The order of the sagas, shared by the services. */
  readonly queue?: SagaQueue | undefined;
}): SpeechService {
  const dictateInterims = createCell<readonly string[]>(EMPTY_INTERIMS, notify);
  const dictateState = createCell<number>(IDLE, notify);
  const shouldSpeakIncomingActivity = createCell(false, notify);
  // While online.
  let session: { readonly userID: string } | undefined;

  // A `put()` of a saga: after the current action. An error stops everything, as an uncaught saga error.
  const put = (fn: () => void) =>
    queue.later(() => {
      try {
        fn();
      } catch (error) {
        connection.fail(error, { insideWrite: true });
      }
    });

  // After an error that stops everything, no saga runs anymore.
  const isRunning = () => !connection.hasFailed();

  const getSpeakingActivities = (): readonly WebChatActivity[] =>
    activitiesStore.getSnapshot().sortedActivities.filter(speakingActivity);

  // startDictateOnSpeakCompleteSaga, after every MARK_ACTIVITY and SET_DICTATE_STATE.
  const startDictateIfSpoken = () => {
    isRunning() &&
      dictateState.get() === WILL_START &&
      !getSpeakingActivities().length &&
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      put(writeStartDictate);
  };

  // The writes: the reducers, then the sagas waiting for the action.
  const writeStartDictate = () => dictateState.set(nextDictateState(dictateState.get(), 'start'));
  const writeStopDictate = () => dictateState.set(nextDictateState(dictateState.get(), 'stop'));

  const writeDictateState = (value: number) => {
    dictateState.set(value);
    startDictateIfSpoken();
  };

  // An activity without ID is not marked, as the reducer.
  const writeMark = ({ id }: { readonly id?: string | undefined }, name: string, value: unknown) => {
    activitiesStore.markActivity(id as string, name, value);
    startDictateIfSpoken();
  };

  const writeStartSpeaking = () => shouldSpeakIncomingActivity.set(true);

  // markAllAsSpokenOnStopSpeakActivitySaga: one mark after the other, each after what the previous one started.
  const markAsSpoken = (activities: readonly WebChatActivity[], index: number) => {
    // eslint-disable-next-line security/detect-object-injection
    const activity = activities[index];

    activity &&
      put(() => {
        writeMark(activity, 'speak', false);
        markAsSpoken(activities, index + 1);
      });
  };

  const writeStopSpeaking = () => {
    shouldSpeakIncomingActivity.set(false);
    isRunning() && markAsSpoken(getSpeakingActivities(), 0);
  };

  connection.onOnline(({ userID }: ConnectionSession) => {
    const current = Object.freeze({ userID });

    session = current;

    // In the order the sagas were started (and wait again, after each action they take).
    const stops = [
      // startSpeakActivityOnPostActivitySaga
      queue.onAction(
        action => action.type === 'POST_ACTIVITY_PENDING',
        action =>
          action.type === 'POST_ACTIVITY_PENDING' &&
          // In continuous mode, everything is spoken; otherwise, the answer to a message by speech.
          (dictateState.get() === DICTATING || (action.method === 'speech' && action.activity.type === 'message')) &&
          put(writeStartSpeaking)
      ),
      // stopDictateOnCardActionSaga: any message, not only card actions; continuous mode goes on.
      queue.onAction(
        action => action.type === 'POST_ACTIVITY_PENDING' && action.activity.type === 'message',
        () => dictateState.get() !== DICTATING && put(writeStopDictate)
      ),
      // stopSpeakingActivityOnInputSaga: typing, a message by keyboard (or a card action), and barge-in (interims).
      queue.onAction(
        action =>
          (action.type === 'SET_SEND_BOX' && !!action.text) ||
          action.type === 'POST_ACTIVITY_PENDING' ||
          action.type === 'SET_DICTATE_INTERIMS',
        action => {
          if (
            action.type === 'POST_ACTIVITY_PENDING' &&
            (dictateState.get() === DICTATING || action.method === 'speech' || action.activity.type !== 'message')
          ) {
            return;
          }

          put(writeStopSpeaking);
        }
      )
    ];

    return () => {
      stops.forEach(stop => stop());
      session === current && (session = undefined);
    };
  });

  // speakActivityAndStartDictateOnIncomingActivityFromOthersSaga, after the echo of the outgoing service. An error (an
  // attachment with `content: null`) is thrown to the incoming service: everything stops.
  incoming.onActivity(activity => {
    const current = session;

    if (!current || !isFromOthers(activity, current.userID)) {
      return;
    }

    const willSpeak = speakableActivity(activity) && shouldSpeakIncomingActivity.get();
    const { inputHint } = activity as WebChatActivity & { readonly inputHint?: string | undefined };
    const currentDictateState = dictateState.get();
    const shouldMark = willSpeak && hasSpeakableContent(activity);

    let next: (() => void) | undefined;

    if (willSpeak && inputHint === 'expectingInput') {
      // In continuous mode (dictating), it does not change: "will start" starts once everything is spoken.
      currentDictateState === IDLE && (next = () => writeDictateState(WILL_START));
    } else if (inputHint === 'ignoringInput') {
      next = writeStopDictate;
    }

    if (shouldMark) {
      put(() => {
        writeMark(activity, 'speak', true);
        next && put(next);
      });
    } else {
      next && put(next);
    }
  });

  return Object.freeze({
    dictateInterims: Object.freeze({ get: dictateInterims.get, subscribe: dictateInterims.subscribe }),
    dictateState: Object.freeze({ get: dictateState.get, subscribe: dictateState.subscribe }),
    markActivity: (activity: { readonly id: string }, name: string, value: unknown) =>
      queue.batch(() => writeMark(activity, name, value)),
    setDictateInterims: (value: readonly string[]) =>
      queue.batch(() => {
        throwIfUndefined(value, 'WEB_CHAT/SET_DICTATE_INTERIMS', 'dictateInterims');
        dictateInterims.set(value);
        queue.handleAction({ type: 'SET_DICTATE_INTERIMS' });
      }),
    setDictateState: (value: number) =>
      queue.batch(() => {
        throwIfUndefined(value, 'WEB_CHAT/SET_DICTATE_STATE', 'dictateState');
        writeDictateState(value);
      }),
    shouldSpeakIncomingActivity: Object.freeze({
      get: shouldSpeakIncomingActivity.get,
      subscribe: shouldSpeakIncomingActivity.subscribe
    }),
    startDictate: () => queue.batch(writeStartDictate),
    startSpeakingActivity: () => queue.batch(writeStartSpeaking),
    stopDictate: () => queue.batch(writeStopDictate),
    stopSpeakingActivity: () => queue.batch(writeStopSpeaking)
  });
}

export type { SpeechActivitiesStore, SpeechService };
