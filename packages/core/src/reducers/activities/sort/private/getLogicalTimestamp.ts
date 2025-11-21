import type { GlobalScopePonyfill } from '../../../../types/GlobalScopePonyfill';
import type { Activity } from '../types';

/**
 * Get sequence ID from `activity.channelData['webchat:sequence-id']` and fallback to `+new Date(activity.timestamp)`.
 *
 * Chat adapter may send sequence ID to affect activity reordering. Sequence ID is supposed to be Unix timestamp.
 *
 * @param activity Activity to get sequence ID from.
 * @returns Sequence ID.
 */
export default function getLogicalTimestamp(
  activity: Activity,
  ponyfill: Pick<GlobalScopePonyfill, 'Date'>
): number | undefined {
  const sequenceId = activity.channelData?.['webchat:sequence-id'];

  if (typeof sequenceId === 'number') {
    return sequenceId;
  }

  const { timestamp } = activity;

  if (typeof timestamp === 'string') {
    return +new ponyfill.Date(timestamp);
  } else if (typeof timestamp !== 'undefined' && (timestamp as any) instanceof ponyfill.Date) {
    console.warn('botframework-webchat: "timestamp" must be of type string, instead of Date.');

    return +timestamp;
  }

  return undefined;
}
