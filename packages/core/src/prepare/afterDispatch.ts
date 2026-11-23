import { DELETE_ACTIVITY } from '../actions/deleteActivity';
import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { POST_ACTIVITY_FULFILLED, POST_ACTIVITY_PENDING } from '../actions/postActivity';
import { VOICE_START_RECORDING } from '../actions/startVoiceRecording';
import { toIncomingActivity, type GroupedActivitiesState } from '../reducers/activities/groupedActivities';
import type { RestrictedStoreDebugAPI } from '../types/StoreDebugAPI';
import type { WebChatActivity } from '../types/WebChatActivity';
import isDate from '../utils/isDate';
import type { PreparedIncomingActivityAction } from './types';

type AfterDispatchContext = {
  readonly debugAPI: RestrictedStoreDebugAPI;
  /** The state before the action was reduced. */
  readonly previousState: {
    readonly groupedActivities: GroupedActivitiesState;
    readonly voice: { readonly voiceState: string };
  };
};

function warnIfTimestampIsDate({ timestamp }: WebChatActivity): void {
  isDate(timestamp) && console.warn('botframework-webchat: "timestamp" must be of type string, instead of Date.');
}

// For each action type, what used to run inside its reducers but is a side effect: debug breakpoints and warnings.
const EFFECTS: ReadonlyMap<string, (action: any, context: AfterDispatchContext) => void> = new Map<
  string,
  (action: any, context: AfterDispatchContext) => void
>([
  [
    DELETE_ACTIVITY,
    () =>
      console.warn(
        'botframework-webchat: Delete activity is being deprecated, please build your own chat adapter instead.'
      )
  ],
  [
    INCOMING_ACTIVITY,
    (action: PreparedIncomingActivityAction, { debugAPI, previousState }) => {
      const {
        meta: { fallbackId },
        payload: { activity }
      } = action;

      // The debug context cannot call `getState()` while the store is reducing: the breakpoint is called in a microtask,
      // with the activity as the reducer put it in the transcript.
      queueMicrotask(() =>
        debugAPI.UNSAFE_callBreakpoint.incomingActivity({
          activity: toIncomingActivity(previousState.groupedActivities, action)
        })
      );

      warnIfTimestampIsDate(activity);

      activity.from?.role !== 'user' &&
        !activity.id &&
        console.warn(
          'botframework-webchat: Incoming activity must have "id" field set, assigning a random value as ID',
          {
            activity,
            newActivityId: fallbackId
          }
        );
    }
  ],
  [POST_ACTIVITY_FULFILLED, ({ payload: { activity } }) => warnIfTimestampIsDate(activity)],
  [POST_ACTIVITY_PENDING, ({ payload: { activity } }) => warnIfTimestampIsDate(activity)],
  [
    VOICE_START_RECORDING,
    (_, { previousState: { voice } }) =>
      voice.voiceState !== 'idle' &&
      console.warn(`botframework-webchat: Should not transit from "${voice.voiceState}" to "listening"`)
  ]
]);

/** Runs the side effects of an action, once, after the reducers reduced it (`prepareAction()` prepared it). */
export default function afterDispatch(action: { readonly type: string }, context: AfterDispatchContext): void {
  EFFECTS.get(action.type)?.(action, context);
}

export type { AfterDispatchContext };
