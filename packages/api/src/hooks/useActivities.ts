import { useOrderedActivities } from '@msinternal/botframework-webchat-api-graph';
import type { WebChatActivity } from 'botframework-webchat-core';

/**
 * Returns the activities, in order.
 *
 * Under a Redux store, in development builds, `<ReduxActivitiesCrossCheck>` checks them against the store.
 */
export default function useActivities(): readonly [readonly WebChatActivity[]] {
  return useOrderedActivities();
}
