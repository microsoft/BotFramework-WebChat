import { INCOMING_ACTIVITY } from '../../actions/incomingActivity';
import markActivity, { MARK_ACTIVITY } from '../../actions/markActivity';
import { POST_ACTIVITY_PENDING } from '../../actions/postActivity';
import { SET_DICTATE_INTERIMS } from '../../actions/setDictateInterims';
import setDictateState, { SET_DICTATE_STATE } from '../../actions/setDictateState';
import { SET_SEND_BOX } from '../../actions/setSendBox';
import startDictate from '../../actions/startDictate';
import startSpeakingActivity from '../../actions/startSpeakingActivity';
import stopDictate from '../../actions/stopDictate';
import stopSpeakingActivity, { STOP_SPEAKING_ACTIVITY } from '../../actions/stopSpeakingActivity';
import { DICTATING, IDLE, WILL_START } from '../../constants/DictateState';
import speakableActivity from '../../definitions/speakableActivity';
import speakingActivity from '../../definitions/speakingActivity';
import { of as activitiesOf } from '../../selectors/activities';
import dictateStateSelector from '../../selectors/dictateState';
import shouldSpeakIncomingActivitySelector from '../../selectors/shouldSpeakIncomingActivity';
import type { ReduxState } from '../../types/internal/ReduxState';
import { putEach } from '../private/effects';
import type { Machine, Scope } from '../types';

// `ReduxState` types the dictate state as a string; the reducer keeps the numbers of `constants/DictateState`.
const selectDictateState = (scope: Scope): number =>
  scope.select(dictateStateSelector as (state: ReduxState) => unknown) as number;

// The Web Speech calls stay in the components.

/**
 * While online, an activity from others (from any source) is marked to be spoken if speaking the incoming activities; if
 * it expects input, the dictation will start once it is spoken (unless dictating continuously); if it ignores input,
 * the dictation stops.
 */
export const speakActivityAndStartDictateOnIncomingActivityFromOthersMachine: Machine = scope =>
  scope.whileOnline(({ userID }, online) =>
    online.on(
      ({ payload, type }) =>
        // In Direct Line, the "role" is not filled (yet), but we do know the user ID.
        // In Direct Line Speech, we do not know the user ID, but "role" is filled with "bot" or "user".
        // Here, we do two checks: the speakable activity must not have user ID, and must not have role === 'user'
        type === INCOMING_ACTIVITY && payload.activity.from.id !== userID && payload.activity.from.role !== 'user',
      ({ payload: { activity } }, worker) => {
        const shouldSpeakIncomingActivity = worker.select(shouldSpeakIncomingActivitySelector);
        const dictateState = selectDictateState(worker);
        const shouldSpeak = speakableActivity(activity) && shouldSpeakIncomingActivity;

        const afterMark = () => {
          if (shouldSpeak && activity.inputHint === 'expectingInput') {
            // WILL_START: start once the speech completed; not while dictating continuously (LISTENING).
            dictateState === IDLE && worker.put(setDictateState(WILL_START));
          } else if (activity.inputHint === 'ignoringInput') {
            worker.put(stopDictate());
          }
        };

        shouldSpeak &&
        (activity.speak ||
          activity.text ||
          // TODO: [P2] An attachment with `content: null` throws here, which stops every machine.
          ~(activity.attachments || []).findIndex(
            ({ content: { speak } = {} }: { readonly content?: { readonly speak?: string } }) => speak
          ))
          ? worker.put(markActivity(activity, 'speak', true), afterMark)
          : afterMark();
      }
    )
  );

/** The dictation starts once nothing is to be spoken, if it will start. */
export const startDictateOnSpeakCompleteMachine: Machine = scope =>
  scope.on(
    ({ type }) => type === MARK_ACTIVITY || type === SET_DICTATE_STATE,
    (_, worker) => {
      const speakingActivities = worker.select(activitiesOf(speakingActivity));
      const dictateState = selectDictateState(worker);

      dictateState === WILL_START && !speakingActivities.length && worker.put(startDictate());
    }
  );

/** Stopping the speech marks the activities to be spoken as spoken. */
export const markAllAsSpokenOnStopSpeakActivityMachine: Machine = scope =>
  scope.on(
    ({ type }) => type === STOP_SPEAKING_ACTIVITY,
    (_, worker) =>
      putEach(
        worker,
        worker.select(activitiesOf(speakingActivity)).map(activity => markActivity(activity as any, 'speak', false))
      )
  );

/**
 * While online, posting while dictating continuously, or a message by speech, starts speaking the incoming activities.
 */
export const startSpeakActivityOnPostActivityMachine: Machine = scope =>
  scope.whileOnline((_, online) =>
    online.on(
      ({ type }) => type === POST_ACTIVITY_PENDING,
      ({ meta, payload }, worker) => {
        const dictateState = selectDictateState(worker);

        (dictateState === DICTATING || (meta.method === 'speech' && payload.activity.type === 'message')) &&
          worker.put(startSpeakingActivity());
      }
    )
  );

/**
 * While online, posting a message (as a card action does) stops the dictation, unless dictating continuously.
 */
export const stopDictateOnCardActionMachine: Machine = scope =>
  scope.whileOnline((_, online) =>
    online.on(
      ({ payload, type }) => type === POST_ACTIVITY_PENDING && payload.activity.type === 'message',
      (_action, worker) => {
        selectDictateState(worker) !== DICTATING && worker.put(stopDictate());
      }
    )
  );

/**
 * While online, typing, interims (barge-in) and posting a message by keyboard stop the speech; not posting while
 * dictating continuously, by speech, or anything but a message.
 */
export const stopSpeakingActivityOnInputMachine: Machine = scope =>
  scope.whileOnline((_, online) =>
    online.on(
      ({ payload, type }) =>
        (type === SET_SEND_BOX && payload.text) || type === POST_ACTIVITY_PENDING || type === SET_DICTATE_INTERIMS,
      ({ meta, payload, type }, worker) => {
        const dictateState = selectDictateState(worker);

        (type !== POST_ACTIVITY_PENDING ||
          !(dictateState === DICTATING || meta.method === 'speech' || payload.activity.type !== 'message')) &&
          worker.put(stopSpeakingActivity());
      }
    )
  );
