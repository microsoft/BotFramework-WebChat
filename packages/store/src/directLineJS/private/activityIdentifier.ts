import type { BlankNodeIdentifier } from '../../node/BlankNodeIdentifier.ts';

/**
 * Gets the alternate identifier of the node which represents the activity with the specified server activity ID
 * (`activity.id`), for `Store.queryByIdentifier()`.
 */
function getActivityIdentifier(activityId: string): BlankNodeIdentifier {
  return `_:activity:${activityId}`;
}

/**
 * Gets the alternate identifier of the node which represents the activity with the specified client activity ID
 * (`activity.channelData.clientActivityID`), for `Store.queryByIdentifier()`.
 */
function getClientActivityIdentifier(clientActivityId: string): BlankNodeIdentifier {
  return `_:client-activity:${clientActivityId}`;
}

export { getActivityIdentifier, getClientActivityIdentifier };
