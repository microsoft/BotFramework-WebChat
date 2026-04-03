/* eslint-disable complexity */
import type { GlobalScopePonyfill } from '../../../types/GlobalScopePonyfill';
import getActivityLivestreamingMetadata from '../../../utils/getActivityLivestreamingMetadata';
import computePartListTimestamp from './private/computePartListTimestamp';
import computeSortedActivities from './private/computeSortedActivities';
import getLogicalTimestamp from './private/getLogicalTimestamp';
import getPartGroupingMetadataMap from './private/getPartGroupingMetadataMap';
import insertSorted from './private/insertSorted';
import { toSpliced } from '@msinternal/botframework-webchat-base/utils';
import { getLocalIdFromActivity } from './property/LocalId';
import { queryPositionFromActivity, setPositionInActivity } from './property/Position';
import {
  type Activity,
  type ActivityMapEntry,
  type HowToGroupingId,
  type LivestreamSessionId,
  type LivestreamSessionMapEntry,
  type LivestreamSessionMapEntryActivityEntry,
  type SortedChatHistoryEntry,
  type State
} from './types';

// Honoring timestamp or not:
//
// - Update activity
//    - (Should honor) every changes
// - Echo back activity
//    - (Should honor) timestamp of echo back of outgoing message
// - Livestream activity
//    - (Should not honor) timestamp of revisions of livestream as it could "flash" them to the bottom
//       - Should not update session timestamp
//    - How:
//       - If it's 1 or Nth revision, copy the timestamp from upserting activity into session
//       - Otherwise, it's 2...N-1, don't copy the timestamp into session
// - HowTo part grouping
//    - (Should not honor) timestamp change via livestream as it could "flash" them to the bottom
//       - Not honoring by copying the timestamp from livestream session
//    - How: copy the timestamp from the upserting part (livestream or update) into part grouping
//
// Simplifying/concluding all rules:
//
// - Always copy timestamp, except when it's a livestream of 2...N-1 revision
// - Part grouping timestamp is copied from upserting entry (either livestream session or activity)

const POSITION_INCREMENT = 1_000;

const INITIAL_STATE = Object.freeze({
  activityIdToLocalIdMap: Object.freeze(new Map()),
  activityMap: Object.freeze(new Map()),
  clientActivityIdToLocalIdMap: Object.freeze(new Map()),
  livestreamSessionMap: Object.freeze(new Map()),
  howToGroupingMap: Object.freeze(new Map()),
  sortedActivities: Object.freeze([]),
  sortedChatHistoryList: Object.freeze([])
} satisfies State);

// Question: Why insertion sort works but not quick sort?
// Short answer: Arrival order matters.
// Long answer:
// - Update activity: when replacing an activity, data from their previous revision matters
// - Duplicate timestamps: activities without timestamp can't be sort deterministically with quick sort

function upsert(ponyfill: Pick<GlobalScopePonyfill, 'Date'>, state: State, activity: Activity): State {
  const activityLocalId = getLocalIdFromActivity(activity);
  const logicalTimestamp = getLogicalTimestamp(activity, ponyfill);
  const activityLivestreamingMetadata = getActivityLivestreamingMetadata(activity);

  // #region Streaming fast path
  //
  // For revision 2..N-1 of an existing, non-finalized livestream session without HowTo grouping:
  // avoid the heavier full rebuild path, including sortedChatHistoryList recomputation,
  // computeSortedActivities, and full position resequencing. This is still not constant-time:
  // the fast path continues to clone Maps and update sortedActivities, but it avoids the
  // broader recomputation required for the general case.
  if (activityLivestreamingMetadata) {
    const sessionId = activityLivestreamingMetadata.sessionId as LivestreamSessionId;
    const existingSession = state.livestreamSessionMap.get(sessionId);
    const finalized = activityLivestreamingMetadata.type === 'final activity';

    if (
      existingSession &&
      !existingSession.finalized &&
      !finalized &&
      !getPartGroupingMetadataMap(activity).has('HowTo')
    ) {
      // Defer all Map cloning until after the position-collision check succeeds.
      // First build the next session entry (needed to determine insertIndex), then
      // locate the insertion point in sortedActivities, compute the new position,
      // and only clone Maps when we know the fast path will be taken.

      // 1. Compute the next session entry (needed to find insertIndex).
      //    Timestamp is NOT updated for rev 2..N-1 (only for first and final).
      const nextSessionEntry: LivestreamSessionMapEntry = {
        activities: Object.freeze(
          insertSorted<LivestreamSessionMapEntryActivityEntry>(
            existingSession.activities,
            Object.freeze({
              activityLocalId,
              logicalTimestamp,
              sequenceNumber: activityLivestreamingMetadata.sequenceNumber,
              type: 'activity'
            }),
            ({ sequenceNumber: x }, { sequenceNumber: y }) =>
              typeof x === 'undefined' || typeof y === 'undefined'
                ? // eslint-disable-next-line no-magic-numbers
                  -1
                : x - y
          )
        ),
        finalized: false,
        logicalTimestamp: existingSession.logicalTimestamp
      };

      // 2. sortedActivities: find the insertion point before cloning anything.
      //    The session's activities are sorted by sequence number via insertSorted.
      //    Find where the new activity landed in that list and locate the correct
      //    insertion point in sortedActivities relative to its session neighbors.
      const newIndexInSession = nextSessionEntry.activities.findIndex(
        entry => entry.activityLocalId === activityLocalId
      );

      const successorInSession =
        newIndexInSession + 1 < nextSessionEntry.activities.length
          ? nextSessionEntry.activities[newIndexInSession + 1]
          : undefined;

      let insertIndex = state.sortedActivities.length;

      if (successorInSession) {
        // Insert before the successor activity in sortedActivities.
        for (let i = 0; i < state.sortedActivities.length; i++) {
          // eslint-disable-next-line security/detect-object-injection
          if (getLocalIdFromActivity(state.sortedActivities[i]!) === successorInSession.activityLocalId) {
            insertIndex = i;
            break;
          }
        }
      } else {
        // New activity is last in the session; insert after the previous last activity.
        // eslint-disable-next-line no-magic-numbers
        const prevLastSessionActivity = existingSession.activities.at(-1);

        if (prevLastSessionActivity) {
          for (let i = state.sortedActivities.length - 1; i >= 0; i--) {
            // eslint-disable-next-line security/detect-object-injection
            if (getLocalIdFromActivity(state.sortedActivities[i]!) === prevLastSessionActivity.activityLocalId) {
              insertIndex = i + 1;
              break;
            }
          }
        }
      }

      // 3. Position: assign the new activity a position based on its neighbors.
      const prevPosition =
        insertIndex > 0 ? (queryPositionFromActivity(state.sortedActivities[insertIndex - 1]!) ?? 0) : 0;

      const nextSiblingPosition =
        insertIndex < state.sortedActivities.length
          ? queryPositionFromActivity(state.sortedActivities[+insertIndex]!)
          : undefined;

      let newPosition = prevPosition + POSITION_INCREMENT;

      // Squeeze if the default increment would collide with the next sibling.
      if (typeof nextSiblingPosition !== 'undefined' && newPosition >= nextSiblingPosition) {
        newPosition = prevPosition + 1;
      }

      // If position is valid (no collision), clone Maps and return fast path result.
      // Otherwise fall through to slow path for full re-sequencing.
      if (typeof nextSiblingPosition === 'undefined' || newPosition < nextSiblingPosition) {
        const positionedActivity = setPositionInActivity(activity, newPosition);

        // 4. activityIdToLocalIdMap: reuse if no activity.id, copy + add otherwise.
        let nextActivityIdToLocalIdMap = state.activityIdToLocalIdMap;

        if (typeof activity.id !== 'undefined') {
          nextActivityIdToLocalIdMap = new Map(state.activityIdToLocalIdMap);
          nextActivityIdToLocalIdMap.set(activity.id, activityLocalId);
        }

        // 5. activityMap: +1 entry with the positioned activity.
        const nextActivityMap = new Map(state.activityMap);

        nextActivityMap.set(
          activityLocalId,
          Object.freeze({ activity: positionedActivity, activityLocalId, logicalTimestamp, type: 'activity' as const })
        );

        // 6. clientActivityIdToLocalIdMap: reuse if no clientActivityID, copy + add otherwise.
        const { clientActivityID } = activity.channelData;
        let nextClientActivityIdToLocalIdMap = state.clientActivityIdToLocalIdMap;

        if (typeof clientActivityID !== 'undefined') {
          nextClientActivityIdToLocalIdMap = new Map(state.clientActivityIdToLocalIdMap);
          nextClientActivityIdToLocalIdMap.set(clientActivityID, activityLocalId);
        }

        // 7. livestreamSessionMap: record the updated session.
        const nextLivestreamSessionMap = new Map(state.livestreamSessionMap);

        nextLivestreamSessionMap.set(sessionId, Object.freeze(nextSessionEntry));

        return Object.freeze({
          activityIdToLocalIdMap: Object.freeze(nextActivityIdToLocalIdMap),
          activityMap: Object.freeze(nextActivityMap),
          clientActivityIdToLocalIdMap: Object.freeze(nextClientActivityIdToLocalIdMap),
          howToGroupingMap: state.howToGroupingMap,
          livestreamSessionMap: Object.freeze(nextLivestreamSessionMap),
          sortedActivities: Object.freeze(toSpliced(state.sortedActivities, insertIndex, 0, positionedActivity)),
          sortedChatHistoryList: state.sortedChatHistoryList
        } satisfies State);
      }
    }
  }

  // #endregion

  // Slow path: full recalculation for non-streaming, first/final revisions, reorders, or HowTo grouping.
  const nextActivityIdToLocalIdMap = new Map(state.activityIdToLocalIdMap);
  const nextActivityMap = new Map(state.activityMap);
  const nextClientActivityIdToLocalIdMap = new Map(state.clientActivityIdToLocalIdMap);
  const nextLivestreamSessionMap = new Map(state.livestreamSessionMap);
  const nextHowToGroupingMap = new Map(state.howToGroupingMap);
  let nextSortedChatHistoryList = Array.from(state.sortedChatHistoryList);

  if (typeof activity.id !== 'undefined') {
    nextActivityIdToLocalIdMap.set(activity.id, activityLocalId);
  }

  const { clientActivityID } = activity.channelData;

  if (typeof clientActivityID !== 'undefined') {
    nextClientActivityIdToLocalIdMap.set(clientActivityID, activityLocalId);
  }

  nextActivityMap.set(
    activityLocalId,
    Object.freeze({
      activity,
      activityLocalId,
      logicalTimestamp,
      type: 'activity'
    })
  );

  let sortedChatHistoryListEntry: SortedChatHistoryEntry = {
    activityLocalId,
    logicalTimestamp,
    type: 'activity'
  };

  // #region Livestreaming

  if (activityLivestreamingMetadata) {
    const sessionId = activityLivestreamingMetadata.sessionId as LivestreamSessionId;

    const livestreamSessionMapEntry = nextLivestreamSessionMap.get(sessionId);

    const wasFinalized = livestreamSessionMapEntry ? livestreamSessionMapEntry.finalized : false;

    if (wasFinalized) {
      console.warn(
        `botframework-webchat: Cannot update livestreaming session ${sessionId} because it has been concluded`
      );

      // This is a special case.
      // TODO: [P1] Revisit this and see how we should process activity after the livestream is finalized.
      //            1. Received a previous-and-valid revision while the livestream is finalized (probably should keep to maintain history)
      //            2. Received a final activity while the livestream is already finalized (probably drop due to bad packet)
      // Related to /__tests__/html2/livestream/concludedLivestream.html.
      return state;
    }

    const finalized = activityLivestreamingMetadata.type === 'final activity';

    const nextLivestreamSessionMapEntry = {
      activities: Object.freeze(
        insertSorted<LivestreamSessionMapEntryActivityEntry>(
          livestreamSessionMapEntry ? livestreamSessionMapEntry.activities : [],
          Object.freeze({
            activityLocalId,
            logicalTimestamp,
            sequenceNumber: activityLivestreamingMetadata.sequenceNumber,
            type: 'activity'
          }),
          ({ sequenceNumber: x }, { sequenceNumber: y }) =>
            typeof x === 'undefined' || typeof y === 'undefined'
              ? // eslint-disable-next-line no-magic-numbers
                -1
              : x - y
        )
      ),
      finalized,
      // Update timestamp if the upserting activity is the first or last in the livestream session.
      // We don't update timestamp for 2...N-1, because it would cause too much flickering.
      logicalTimestamp:
        finalized || !livestreamSessionMapEntry ? logicalTimestamp : livestreamSessionMapEntry.logicalTimestamp
    } satisfies LivestreamSessionMapEntry;

    nextLivestreamSessionMap.set(sessionId, Object.freeze(nextLivestreamSessionMapEntry));

    sortedChatHistoryListEntry = {
      livestreamSessionId: sessionId,
      logicalTimestamp: nextLivestreamSessionMapEntry.logicalTimestamp,
      type: 'livestream session'
    };
  }

  // #endregion

  // #region How-to grouping

  const howToGrouping = getPartGroupingMetadataMap(activity).get('HowTo');

  if (howToGrouping) {
    const howToGroupingId = howToGrouping.groupingId as HowToGroupingId;
    const { position: howToGroupingPosition } = howToGrouping;

    const partGroupingMapEntry = nextHowToGroupingMap.get(howToGroupingId);

    let nextPartList = partGroupingMapEntry ? Array.from(partGroupingMapEntry.partList) : [];

    const existingPartEntryIndex = activityLivestreamingMetadata
      ? nextPartList.findIndex(
          entry =>
            entry.type === 'livestream session' && entry.livestreamSessionId === activityLivestreamingMetadata.sessionId
        )
      : nextPartList.findIndex(entry => entry.type === 'activity' && entry.activityLocalId === activityLocalId);

    const nextPartEntry = Object.freeze({ ...sortedChatHistoryListEntry, position: howToGroupingPosition });

    // If the upserting activity is position-less and an earlier revision is in the grouping, update the existing entry instead of splice/insert.
    if (~existingPartEntryIndex && typeof howToGroupingPosition === 'undefined') {
      nextPartList[+existingPartEntryIndex] = nextPartEntry;
    } else {
      // The upserting activity has position, or it never exist in the grouping.
      ~existingPartEntryIndex && nextPartList.splice(existingPartEntryIndex, 1);

      nextPartList = insertSorted(
        nextPartList,
        nextPartEntry,
        // eslint-disable-next-line no-magic-numbers
        ({ position: x }, { position: y }) => (typeof x === 'undefined' || typeof y === 'undefined' ? -1 : x - y)
      );
    }

    const nextPartGroupingEntry = {
      logicalTimestamp: computePartListTimestamp(nextPartList),
      partList: Object.freeze(nextPartList)
    };

    nextHowToGroupingMap.set(howToGroupingId, Object.freeze(nextPartGroupingEntry));

    sortedChatHistoryListEntry = {
      howToGroupingId,
      logicalTimestamp: nextPartGroupingEntry.logicalTimestamp,
      type: 'how to grouping'
    };
  }

  // #endregion

  // #region Sorted chat history

  const existingSortedChatHistoryListEntryIndex =
    sortedChatHistoryListEntry.type === 'how to grouping'
      ? nextSortedChatHistoryList.findIndex(
          entry =>
            entry.type === 'how to grouping' && entry.howToGroupingId === sortedChatHistoryListEntry.howToGroupingId
        )
      : sortedChatHistoryListEntry.type === 'livestream session'
        ? nextSortedChatHistoryList.findIndex(
            entry =>
              entry.type === 'livestream session' &&
              entry.livestreamSessionId === sortedChatHistoryListEntry.livestreamSessionId
          )
        : sortedChatHistoryListEntry.type === 'activity'
          ? nextSortedChatHistoryList.findIndex(
              entry => entry.type === 'activity' && entry.activityLocalId === activityLocalId
            )
          : // eslint-disable-next-line no-magic-numbers
            -1;

  ~existingSortedChatHistoryListEntryIndex &&
    nextSortedChatHistoryList.splice(existingSortedChatHistoryListEntryIndex, 1);

  nextSortedChatHistoryList = insertSorted(
    nextSortedChatHistoryList,
    Object.freeze(sortedChatHistoryListEntry),
    (x, y) => {
      // Compare logical timestamp if both have it.
      // Otherwise, compare local timestamp if both have it.
      // Otherwise, -1.
      const xLogicalTimestamp = x.logicalTimestamp;
      const yLogicalTimestamp = y.logicalTimestamp;

      if (typeof xLogicalTimestamp !== 'undefined' && typeof yLogicalTimestamp !== 'undefined') {
        return xLogicalTimestamp - yLogicalTimestamp;
      }

      if (x.type === 'activity' && y.type === 'activity') {
        const xActivity = nextActivityMap.get(x.activityLocalId);
        const yActivity = nextActivityMap.get(y.activityLocalId);

        const xLocalTimestamp = xActivity?.activity.localTimestamp;
        const yLocalTimestamp = yActivity?.activity.localTimestamp;

        if (typeof xLocalTimestamp !== 'undefined' && typeof yLocalTimestamp !== 'undefined') {
          return +new ponyfill.Date(xLocalTimestamp) - +new ponyfill.Date(yLocalTimestamp);
        }
      }

      // eslint-disable-next-line no-magic-numbers
      return -1;
    }
  );
  // }

  // #endregion

  // #region Sorted activities

  const nextSortedActivities = computeSortedActivities({
    activityMap: nextActivityMap,
    howToGroupingMap: nextHowToGroupingMap,
    livestreamSessionMap: nextLivestreamSessionMap,
    sortedChatHistoryList: nextSortedChatHistoryList
  });

  // #endregion

  // #region Sequence sorted activities

  let lastPosition = 0;

  for (
    let index = 0, { length: nextSortedActivitiesLength } = nextSortedActivities;
    index < nextSortedActivitiesLength;
    index++
  ) {
    const currentActivity = nextSortedActivities[+index]!;
    const currentActivityId = getLocalIdFromActivity(currentActivity);
    const hasNextSibling = index + 1 < nextSortedActivitiesLength;
    const position = queryPositionFromActivity(currentActivity);

    let nextPosition: number;

    if (typeof position === 'undefined' || position <= lastPosition) {
      if (hasNextSibling) {
        const nextSiblingPosition = queryPositionFromActivity(nextSortedActivities[+index + 1]!);

        nextPosition = lastPosition + 1;

        if (typeof nextSiblingPosition === 'undefined' || nextPosition > nextSiblingPosition) {
          nextPosition = lastPosition + POSITION_INCREMENT;
        }
      } else {
        nextPosition = lastPosition + POSITION_INCREMENT;
      }
    } else {
      nextPosition = position;
    }

    if (nextPosition !== position) {
      const activityMapEntry = nextActivityMap.get(currentActivityId)!;

      const nextActivityEntry: ActivityMapEntry = Object.freeze({
        ...activityMapEntry,
        // TODO: [P0] We should freeze the activity.
        //       For backcompat, we should consider have a props that temporarily disable this behavior.
        activity: setPositionInActivity(activityMapEntry.activity, nextPosition)
      });

      nextActivityMap.set(currentActivityId, nextActivityEntry);

      nextSortedActivities[+index] = nextActivityEntry.activity;
    }

    lastPosition = nextPosition;
  }

  // #endregion

  return Object.freeze({
    activityIdToLocalIdMap: Object.freeze(nextActivityIdToLocalIdMap),
    activityMap: Object.freeze(nextActivityMap),
    clientActivityIdToLocalIdMap: Object.freeze(nextClientActivityIdToLocalIdMap),
    howToGroupingMap: Object.freeze(nextHowToGroupingMap),
    livestreamSessionMap: Object.freeze(nextLivestreamSessionMap),
    sortedActivities: Object.freeze(nextSortedActivities),
    sortedChatHistoryList: Object.freeze(nextSortedChatHistoryList)
  } satisfies State);
}

export default upsert;
export { INITIAL_STATE };
