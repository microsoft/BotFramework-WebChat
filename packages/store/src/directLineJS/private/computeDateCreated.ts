import type { Identifier } from '../../node/NodeIdentifier.ts';
import type { SortedActivity } from './sortState.ts';

// 9999-12-31T23:59:59.999Z, the maximum time which can be represented by a 4-digit year ISO timestamp.
const MAX_TIME = 253_402_300_799_999;

/**
 * Computes `dateCreated` of sorted activities, so sorting by `dateCreated` will yield the same order.
 *
 * `dateCreated` is the logical timestamp if it is later than the previous activity, otherwise, 1 millisecond is added
 * to the `dateCreated` of the previous activity. Thus, `dateCreated` is always strictly increasing.
 *
 * This is a pure function of the sorted activities, when an activity is inserted, only `dateCreated` of the activity and
 * the activities after it with conflicting time will change.
 *
 * Activities without logical timestamp at the start of the list will start from epoch (1970-01-01T00:00:00.000Z).
 *
 * @returns Key is the `@id` of the activity, value is the `dateCreated` in ISO format.
 */
function computeDateCreated(sortedActivities: Iterable<SortedActivity>): ReadonlyMap<Identifier, string> {
  const dateCreatedMap = new Map<Identifier, string>();
  let lastTime: number | undefined;

  for (const { id, logicalTimestamp } of sortedActivities) {
    const time =
      typeof logicalTimestamp === 'number' && logicalTimestamp >= 0 && logicalTimestamp <= MAX_TIME
        ? Math.ceil(logicalTimestamp)
        : undefined;

    lastTime =
      typeof lastTime === 'undefined'
        ? (time ?? 0)
        : typeof time !== 'undefined' && time > lastTime
          ? time
          : lastTime + 1;

    dateCreatedMap.set(id, new Date(Math.min(lastTime, MAX_TIME)).toISOString());
  }

  return Object.freeze(dateCreatedMap);
}

export default computeDateCreated;
