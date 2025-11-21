/* eslint-disable complexity */
import type { GlobalScopePonyfill } from '../../../types/GlobalScopePonyfill';
import getActivityLivestreamingMetadata from '../../../utils/getActivityLivestreamingMetadata';
import computePartListTimestamp from './private/computePartListTimestamp';
import computeSortedActivities from './private/computeSortedActivities';
import getActivityLocalId from './private/getActivityLocalId';
import getLogicalTimestamp from './private/getLogicalTimestamp';
import getPartGroupingMetadataMap from './private/getPartGroupingMetadataMap';
import insertSorted from './private/insertSorted';
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

const INITIAL_STATE = Object.freeze({
  activityIdToLocalIdMap: Object.freeze(new Map()),
  activityMap: Object.freeze(new Map()),
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
  const nextActivityIdToLocalIdMap = new Map(state.activityIdToLocalIdMap);
  const nextActivityMap = new Map(state.activityMap);
  const nextLivestreamSessionMap = new Map(state.livestreamSessionMap);
  const nextHowToGroupingMap = new Map(state.howToGroupingMap);
  let nextSortedChatHistoryList = Array.from(state.sortedChatHistoryList);

  const activityLocalId = getActivityLocalId(activity);
  const logicalTimestamp = getLogicalTimestamp(activity, ponyfill);
  // let shouldSkipPositionalChange = false;

  if (typeof activity.id !== 'undefined') {
    nextActivityIdToLocalIdMap.set(activity.id, activityLocalId);
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

  const activityLivestreamingMetadata = getActivityLivestreamingMetadata(activity);

  if (activityLivestreamingMetadata) {
    const sessionId = activityLivestreamingMetadata.sessionId as LivestreamSessionId;

    const livestreamSessionMapEntry = nextLivestreamSessionMap.get(sessionId);

    const wasFinalized = livestreamSessionMapEntry ? livestreamSessionMapEntry.finalized : false;

    if (wasFinalized) {
      console.warn(
        `botframework-webchat: Cannot update livestreaming session ${sessionId} because it has been concluded`
      );

      // This is a special case.
      // In the future, we should revisit this and see if we should still process this activity or not.
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

    // If the upserting activity is position-less and an earlier revision is in the grouping, update the existing entry.
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
  const POSITION_INCREMENT = 1_000;

  for (
    let index = 0, { length: nextSortedActivitiesLength } = nextSortedActivities;
    index < nextSortedActivitiesLength;
    index++
  ) {
    const currentActivity = nextSortedActivities[+index]!;
    const currentActivityId = getActivityLocalId(currentActivity);
    const hasNextSibling = index + 1 < nextSortedActivitiesLength;
    const position = currentActivity.channelData['webchat:internal:position'];

    let nextPosition: number;

    if (typeof position === 'undefined' || position <= lastPosition) {
      if (hasNextSibling) {
        const nextSiblingPosition = nextSortedActivities[+index + 1]!.channelData['webchat:internal:position'];

        nextPosition = lastPosition + 1;

        if (nextPosition > nextSiblingPosition) {
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
        //       For backcompat, we can consider have a props that temporarily disable this behavior.
        activity: {
          ...activityMapEntry.activity,
          channelData: {
            ...activityMapEntry.activity.channelData,
            'webchat:internal:position': nextPosition
          } as any
        }
      });

      nextActivityMap.set(currentActivityId, nextActivityEntry);

      nextSortedActivities[+index] = nextActivityEntry.activity;
    }

    lastPosition = nextPosition;
  }

  // #endregion

  // console.log(
  //   `${activityLocalId}\n${activity.text}`,
  //   Object.freeze({
  //     activity,
  //     activityMap: nextActivityMap,
  //     howToGroupingMap: nextHowToGroupingMap,
  //     livestreamSessionMap: nextLivestreamSessionMap,
  //     sortedActivities: nextSortedActivities,
  //     sortedChatHistoryList: nextSortedChatHistoryList
  //   })
  // );

  return Object.freeze({
    activityIdToLocalIdMap: Object.freeze(nextActivityIdToLocalIdMap),
    activityMap: Object.freeze(nextActivityMap),
    howToGroupingMap: Object.freeze(nextHowToGroupingMap),
    livestreamSessionMap: Object.freeze(nextLivestreamSessionMap),
    sortedActivities: Object.freeze(nextSortedActivities),
    sortedChatHistoryList: Object.freeze(nextSortedChatHistoryList)
  } satisfies State);
}

export default upsert;
export { INITIAL_STATE };
