import type { ActivitiesCoreEnv } from '../ActivitiesCoreEnv';
import type { ActivitiesCoreState } from '../types';
import type { WebChatActivity } from '../types/WebChatActivity';
import upsert from '../upsert';
import prepareIncomingActivity from './prepareIncomingActivity';

/**
 * An activity arrives from the chat adapter: adds it, or replaces the activity with the same ID (or, from the user, the
 * same client activity ID).
 *
 * Same as `INCOMING_ACTIVITY` in core's reducer.
 */
export default function receiveActivity(
  state: ActivitiesCoreState,
  activity: WebChatActivity,
  env: ActivitiesCoreEnv
): ActivitiesCoreState {
  return upsert(env, state, prepareIncomingActivity(state, activity, env));
}
