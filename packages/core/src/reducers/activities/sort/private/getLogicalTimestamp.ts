import isDate from '../../../../utils/isDate';
import parseTimestamp from '../../../../utils/parseTimestamp';
import type { Activity } from '../types';

/**
 * Get sequence ID from `activity.channelData['webchat:sequence-id']` and fallback to `+new Date(activity.timestamp)`.
 *
 * Chat adapter may send sequence ID to affect activity reordering. Sequence ID is supposed to be Unix timestamp.
 *
 * A `timestamp` given as a `Date` is used too; `afterDispatch()` warns about it.
 *
 * @param activity Activity to get sequence ID from.
 * @returns Sequence ID.
 */
export default function getLogicalTimestamp(activity: Activity): number | undefined {
  const sequenceId = activity.channelData?.['webchat:sequence-id'];

  if (typeof sequenceId === 'number') {
    return sequenceId;
  }

  const { timestamp } = activity;

  if (typeof timestamp === 'string') {
    return parseTimestamp(timestamp);
  } else if (isDate(timestamp)) {
    return +timestamp;
  }

  return undefined;
}
