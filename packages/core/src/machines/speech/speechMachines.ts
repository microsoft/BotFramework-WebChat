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
import { hasSpeakableContent, isFromOthers } from '../../services/private/speakableIncomingActivity';
import type { ReduxState } from '../../types/internal/ReduxState';
import { putEach } from '../private/effects';
import type { Machine, Scope } from '../types';

// `ReduxState` types the dictate state as a string; the reducer keeps the numbers of `constants/DictateState`.
const selectDictateState = (scope: Scope): number =>
  scope.select(dictateStateSelector as (state: ReduxState) => unknown) as number;

// The speech machines, one per saga of the same name. The Web Speech calls stay in the components.
//
// Quirks kept, as the sagas (to fix later): offline (also reconnecting), typing, interims and posts do not stop the
// speech, and nothing is spoken; any mark and any dictate state set (also unchanged) checks whether to start the
// dictation; stopping the speech marks every activity to be spoken as spoken, which then starts the dictation if it
// will start; every message posted stops the dictation unless dictating; an activity ignoring input stops the
// dictation, also when not spoken; a spoken message with an attachment of `content: null` (without `speak` or `text`)
// throws, which stops everything.

/**
 * `speakActivityAndStartDictateOnIncomingActivityFromOthersSaga`: while online, an activity from others (from any
 * source) is marked to be spoken if speaking the incoming activities; if it expects input, the dictation will start
 * once it is spoken (unless dictating continuously); if it ignores input, the dictation stops.
 */
export const speakActivityAndStartDictateOnIncomingActivityFromOthersMachine: Machine = scope =>
  scope.whileOnline(({ userID }, online) =>
    online.on(
      ({ payload, type }) => type === INCOMING_ACTIVITY && isFromOthers(payload.activity, userID),
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

        shouldSpeak && hasSpeakableContent(activity)
          ? worker.put(markActivity(activity, 'speak', true), afterMark)
          : afterMark();
      }
    )
  );

/** `startDictateOnSpeakCompleteSaga`: the dictation starts once nothing is to be spoken, if it will start. */
export const startDictateOnSpeakCompleteMachine: Machine = scope =>
  scope.on(
    ({ type }) => type === MARK_ACTIVITY || type === SET_DICTATE_STATE,
    (_, worker) => {
      const speakingActivities = worker.select(activitiesOf(speakingActivity));
      const dictateState = selectDictateState(worker);

      dictateState === WILL_START && !speakingActivities.length && worker.put(startDictate());
    }
  );

/** `markAllAsSpokenOnStopSpeakActivitySaga`: stopping the speech marks the activities to be spoken as spoken. */
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
 * `startSpeakActivityOnPostActivitySaga`: while online, posting while dictating continuously, or a message by speech,
 * starts speaking the incoming activities.
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
 * `stopDictateOnCardActionSaga`: while online, posting a message (as a card action does) stops the dictation, unless
 * dictating continuously.
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
 * `stopSpeakingActivityOnInputSaga`: while online, typing, interims (barge-in) and posting a message by keyboard stop
 * the speech; not posting while dictating continuously, by speech, or anything but a message.
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
