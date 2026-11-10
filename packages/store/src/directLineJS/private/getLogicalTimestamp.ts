import type { DirectLineActivity } from './DirectLineActivity.ts';

/**
 * Gets sequence ID from `activity.channelData['webchat:sequence-id']` and fallback to `+new Date(activity.timestamp)`,
 * or `undefined` if neither are available or valid.
 *
 * Chat adapter may send sequence ID to affect activity reordering. Sequence ID is supposed to be Unix timestamp.
 */
function getLogicalTimestamp(activity: DirectLineActivity): number | undefined {
  const sequenceId = activity.channelData?.['webchat:sequence-id'];

  if (typeof sequenceId === 'number') {
    return Number.isFinite(sequenceId) ? sequenceId : undefined;
  }

  const time = typeof activity.timestamp === 'string' ? new Date(activity.timestamp).getTime() : NaN;

  return Number.isNaN(time) ? undefined : time;
}

export default getLogicalTimestamp;
