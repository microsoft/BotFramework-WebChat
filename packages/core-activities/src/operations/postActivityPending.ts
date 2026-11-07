// @ts-ignore No @types/simple-update-in
import updateIn from 'simple-update-in';

import type { ActivitiesCoreEnv } from '../ActivitiesCoreEnv';
import patchActivity from '../patchActivity';
import { generateLocalIdInActivity } from '../property/LocalId';
import { setReceivedAtInActivity } from '../property/ReceivedAt';
import { setSendStatusInOutgoingActivity } from '../property/SendStatus';
import type { ActivitiesCoreState } from '../types';
import { SENDING } from '../types/internal/SendStatus';
import type { WebChatActivity } from '../types/WebChatActivity';
import upsert from '../upsert';

/**
 * The user starts sending an activity: adds it with a new local ID, as "sending".
 *
 * Same as `POST_ACTIVITY_PENDING` in core's reducer.
 */
export default function postActivityPending(
  state: ActivitiesCoreState,
  activity: WebChatActivity,
  env: ActivitiesCoreEnv
): ActivitiesCoreState {
  // Patch activity so the outgoing blob: URL is not re-downloadable.
  // Related to /__tests__/html2/accessibility/liveRegion/attachment/file.

  // Why not re-downloadable?
  // - When the activity echo back, the URL will be dummy (not downloadable)
  // - Outgoing -> echo back, the UI will be "downloadable" and flash to "not downloadable" in a short amount of time

  // TODO: [P0] Consider modify attachment middleware so all outgoing activity is not downloadable.

  activity = patchActivity(activity, env);
  activity = setReceivedAtInActivity(activity, env.Date.now());
  activity = generateLocalIdInActivity(activity);
  // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
  // Please refer to #4362 for details. Remove on or after 2024-07-31.
  activity = updateIn(activity, ['channelData', 'state'], () => SENDING);
  activity = setSendStatusInOutgoingActivity(activity, SENDING);

  return upsert(env, state, activity);
}
