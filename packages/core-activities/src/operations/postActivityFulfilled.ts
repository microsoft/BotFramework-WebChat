// @ts-ignore No @types/simple-update-in
import updateIn from 'simple-update-in';

import type { ActivitiesCoreEnv } from '../ActivitiesCoreEnv';
import patchActivity from '../patchActivity';
import { setLocalIdInActivity } from '../property/LocalId';
import { getPositionFromActivity, setPositionInActivity } from '../property/Position';
import { setSendStatusInOutgoingActivity } from '../property/SendStatus';
import queryLocalIdByClientActivityId from '../queryLocalIdByClientActivityId';
import type { ActivitiesCoreState } from '../types';
import { SENT } from '../types/internal/SendStatus';
import type { WebChatActivity } from '../types/WebChatActivity';
import upsert from '../upsert';

/**
 * The chat adapter has sent the activity: replaces the outgoing activity with the one from the service, as "sent", at
 * the same position. Throws if there is no outgoing activity with the client activity ID.
 *
 * Same as `POST_ACTIVITY_FULFILLED` in core's reducer.
 */
export default function postActivityFulfilled(
  state: ActivitiesCoreState,
  clientActivityID: string,
  activity: WebChatActivity,
  env: ActivitiesCoreEnv
): ActivitiesCoreState {
  const localId = queryLocalIdByClientActivityId(state, clientActivityID);

  const existingActivity = localId && state.activityMap.get(localId)?.activity;

  if (!existingActivity) {
    throw new Error(
      'botframework-webchat-internal: On POST_ACTIVITY_FULFILLED, there is no activities with same client activity ID'
    );
  }

  // We will replace the outgoing activity with the version from the server
  activity = patchActivity(activity, env);

  activity = updateIn(
    activity,
    // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
    // Please refer to #4362 for details. Remove on or after 2024-07-31.
    ['channelData', 'state'],
    () => SENT
  );

  activity = setSendStatusInOutgoingActivity(activity, SENT);
  activity = setLocalIdInActivity(activity, localId);

  // Keep existing position.
  activity = setPositionInActivity(activity, getPositionFromActivity(existingActivity));

  // Compare `receiveActivity()`:
  // - `postActivityFulfilled()` will mark send status as SENT
  // - `receiveActivity()` will not change send status and leave it as-is
  return upsert(env, state, activity);
}
