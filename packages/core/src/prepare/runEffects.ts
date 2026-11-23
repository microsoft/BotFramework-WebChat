import { DELETE_ACTIVITY } from '../actions/deleteActivity';
import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { POST_ACTIVITY_FULFILLED, POST_ACTIVITY_PENDING } from '../actions/postActivity';
import { VOICE_START_RECORDING } from '../actions/startVoiceRecording';
import type { GroupedActivitiesState } from '../reducers/activities/groupedActivities';
import type { LivestreamSessionId } from '../reducers/activities/sort/types';
import toIncomingActivity from '../reducers/activities/toIncomingActivity';
import type { RestrictedStoreDebugAPI } from '../types/StoreDebugAPI';
import type { WebChatActivity } from '../types/WebChatActivity';
import getActivityLivestreamingMetadata from '../utils/getActivityLivestreamingMetadata';
import isDate from '../utils/isDate';
import type { PreparedIncomingActivityAction } from './types';

type RunEffectsContext = {
  readonly debugAPI: RestrictedStoreDebugAPI;
  /** The state the reducers get. */
  readonly previousState: {
    readonly groupedActivities: GroupedActivitiesState;
    readonly voice: { readonly voiceState: string };
  };
};

// The warnings of `upsert()`, in its order. The activity has the same timestamp and livestream metadata as the one the
// reducer upserts.
function warnOnUpsert({ livestreamSessionMap }: GroupedActivitiesState, activity: WebChatActivity): void {
  const { sessionId } = getActivityLivestreamingMetadata(activity) || {};

  isDate(activity.timestamp) &&
    console.warn('botframework-webchat: "timestamp" must be of type string, instead of Date.');

  sessionId &&
    livestreamSessionMap.get(sessionId as LivestreamSessionId)?.finalized &&
    console.warn(
      `botframework-webchat: Cannot update livestreaming session ${sessionId} because it has been concluded`
    );
}

// For each action type, what used to run inside its reducers but is a side effect: debug breakpoints and warnings.
const EFFECTS: ReadonlyMap<string, (action: any, context: RunEffectsContext) => void> = new Map<
  string,
  (action: any, context: RunEffectsContext) => void
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
    (action: PreparedIncomingActivityAction, { debugAPI, previousState: { groupedActivities } }) => {
      const {
        meta: { fallbackId },
        payload: { activity }
      } = action;
      const incomingActivity = toIncomingActivity(groupedActivities, action);

      // The debug context reads the next state: call the breakpoint in a microtask, after the reducers, with the activity
      // as the reducer puts it in the transcript.
      queueMicrotask(() => debugAPI.UNSAFE_callBreakpoint.incomingActivity({ activity: incomingActivity }));

      activity.from?.role !== 'user' &&
        !activity.id &&
        console.warn(
          'botframework-webchat: Incoming activity must have "id" field set, assigning a random value as ID',
          {
            activity,
            newActivityId: fallbackId
          }
        );

      warnOnUpsert(groupedActivities, incomingActivity);
    }
  ],
  [
    POST_ACTIVITY_FULFILLED,
    ({ payload: { activity } }, { previousState }) => warnOnUpsert(previousState.groupedActivities, activity)
  ],
  [
    POST_ACTIVITY_PENDING,
    ({ payload: { activity } }, { previousState }) => warnOnUpsert(previousState.groupedActivities, activity)
  ],
  [
    VOICE_START_RECORDING,
    (_, { previousState: { voice } }) =>
      voice.voiceState !== 'idle' &&
      console.warn(`botframework-webchat: Should not transit from "${voice.voiceState}" to "listening"`)
  ]
]);

/**
 * Runs the side effects of an action that `prepareAction()` prepared, once, before the reducers. They read the state
 * the reducers get, not the next state.
 */
export default function runEffects(action: { readonly type: string }, context: RunEffectsContext): void {
  EFFECTS.get(action.type)?.(action, context);
}
