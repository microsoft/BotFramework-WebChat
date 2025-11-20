/* eslint-disable complexity */
import type { GlobalScopePonyfill } from '../../../types/GlobalScopePonyfill';
import getActivityLivestreamingMetadata from '../../../utils/getActivityLivestreamingMetadata';
import getActivityInternalId from './private/getActivityInternalId';
import getLogicalTimestamp from './private/getLogicalTimestamp';
import getPartGroupingMetadataMap from './private/getPartGroupingMetadataMap';
import insertSorted from './private/insertSorted';
import {
  type Activity,
  type ActivityMapEntry,
  type HowToGroupingIdentifier,
  type HowToGroupingMapEntry,
  type LivestreamSessionIdentifier,
  type LivestreamSessionMapEntry,
  type LivestreamSessionMapEntryActivityEntry,
  type SortedChatHistoryEntry,
  type State
} from './types';

const INITIAL_STATE = Object.freeze({
  activityMap: Object.freeze(new Map()),
  livestreamingSessionMap: Object.freeze(new Map()),
  howToGroupingMap: Object.freeze(new Map()),
  sortedActivities: Object.freeze([]),
  sortedChatHistoryList: Object.freeze([])
} satisfies State);

// Question: Why insertion sort works but not quick sort?
// Short answer: Arrival order matters.
// Long answer:
// - Update activity: when replacing an activity, and data from their previous revision still matters
// - Duplicate timestamps: activities without timestamp is consider duplicate value and can't be sort deterministically

function upsert(ponyfill: Pick<GlobalScopePonyfill, 'Date'>, state: State, activity: Activity): State {
  const nextActivityMap = new Map(state.activityMap);
  const nextLivestreamSessionMap = new Map(state.livestreamingSessionMap);
  const nextHowToGroupingMap = new Map(state.howToGroupingMap);
  let nextSortedChatHistoryList = Array.from(state.sortedChatHistoryList);

  const activityInternalId = getActivityInternalId(activity);
  const logicalTimestamp = getLogicalTimestamp(activity, ponyfill);
  let shouldReusePosition = true;

  nextActivityMap.set(
    activityInternalId,
    Object.freeze({
      activity,
      activityInternalId,
      logicalTimestamp,
      type: 'activity'
    })
  );

  let sortedChatHistoryListEntry: SortedChatHistoryEntry = {
    activityInternalId,
    logicalTimestamp,
    type: 'activity'
  };

  // #region Livestreaming

  const activityLivestreamingMetadata = getActivityLivestreamingMetadata(activity);

  if (activityLivestreamingMetadata) {
    const sessionId = activityLivestreamingMetadata.sessionId as LivestreamSessionIdentifier;

    const nextLivestreamingSession = nextLivestreamSessionMap.get(sessionId);

    const finalized =
      (nextLivestreamingSession ? nextLivestreamingSession.finalized : false) ||
      activityLivestreamingMetadata.type === 'final activity';

    // TODO: [P*] Remove this logic. We will not deal with the timestamp in finalized livestream activity.

    // If livestream become finalized in this round and it has timestamp, update the position.
    // The livestream will only have its position updated twice in its lifetime:
    // 1. When it is first inserted into chat history
    // 2. When it become concluded and it has a timestamp
    // if (finalized && !nextLivestreamingSession?.finalized && typeof logicalTimestamp !== 'undefined') {
    //   shouldReusePosition = false;
    // }

    const nextLivestreamingSessionMapEntry = {
      activities: Object.freeze(
        insertSorted<LivestreamSessionMapEntryActivityEntry>(
          nextLivestreamingSession ? nextLivestreamingSession.activities : [],
          Object.freeze({
            activityInternalId,
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
      logicalTimestamp: finalized
        ? logicalTimestamp
        : nextLivestreamingSession
          ? nextLivestreamingSession.logicalTimestamp
          : logicalTimestamp
    } satisfies LivestreamSessionMapEntry;

    nextLivestreamSessionMap.set(sessionId, Object.freeze(nextLivestreamingSessionMapEntry));

    sortedChatHistoryListEntry = {
      livestreamSessionId: sessionId,
      logicalTimestamp: nextLivestreamingSessionMapEntry.logicalTimestamp,
      type: 'livestream session'
    };
  }

  // #endregion

  // #region How-to grouping

  const howToGrouping = getPartGroupingMetadataMap(activity).get('HowTo');

  if (howToGrouping) {
    const howToGroupingId = howToGrouping.groupingId as HowToGroupingIdentifier;
    const { position: howToGroupingPosition } = howToGrouping;

    const nextPartGroupingEntry: HowToGroupingMapEntry =
      nextHowToGroupingMap.get(howToGroupingId) ??
      ({ logicalTimestamp, partList: Object.freeze([]) } satisfies HowToGroupingMapEntry);

    let nextPartList = Array.from(nextPartGroupingEntry.partList);

    const existingPartEntryIndex = activityLivestreamingMetadata
      ? nextPartList.findIndex(
          entry =>
            entry.type === 'livestream session' && entry.livestreamSessionId === activityLivestreamingMetadata.sessionId
        )
      : nextPartList.findIndex(entry => entry.type === 'activity' && entry.activityInternalId === activityInternalId);

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

    nextHowToGroupingMap.set(
      howToGroupingId,
      Object.freeze({
        ...nextPartGroupingEntry,
        partList: Object.freeze(nextPartList)
      } satisfies HowToGroupingMapEntry)
    );

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
              entry => entry.type === 'activity' && entry.activityInternalId === activityInternalId
            )
          : // eslint-disable-next-line no-magic-numbers
            -1;

  if (shouldReusePosition && ~existingSortedChatHistoryListEntryIndex) {
    nextSortedChatHistoryList[+existingSortedChatHistoryListEntryIndex] = Object.freeze(sortedChatHistoryListEntry);
  } else {
    ~existingSortedChatHistoryListEntryIndex &&
      nextSortedChatHistoryList.splice(existingSortedChatHistoryListEntryIndex, 1);

    nextSortedChatHistoryList = insertSorted(
      nextSortedChatHistoryList,
      Object.freeze(sortedChatHistoryListEntry),
      ({ logicalTimestamp: x }, { logicalTimestamp: y }) =>
        // eslint-disable-next-line no-magic-numbers
        typeof x === 'undefined' || typeof y === 'undefined' ? -1 : x - y
    );
  }

  // #endregion

  // #region Sorted activities

  const nextSortedActivities = Array.from<Activity>(
    (function* () {
      for (const sortedEntry of nextSortedChatHistoryList) {
        if (sortedEntry.type === 'activity') {
          // TODO: [P*] Instead of deferencing, use pointer instead.
          yield nextActivityMap.get(sortedEntry.activityInternalId)!.activity;
        } else if (sortedEntry.type === 'how to grouping') {
          const howToGrouping = nextHowToGroupingMap.get(sortedEntry.howToGroupingId)!;

          for (const howToPartEntry of howToGrouping.partList) {
            if (howToPartEntry.type === 'activity') {
              yield nextActivityMap.get(howToPartEntry.activityInternalId)!.activity;
            } else {
              howToPartEntry.type satisfies 'livestream session';

              for (const activityEntry of nextLivestreamSessionMap.get(howToPartEntry.livestreamSessionId)!
                .activities) {
                yield nextActivityMap.get(activityEntry.activityInternalId)!.activity;
              }
            }
          }
        } else {
          sortedEntry.type satisfies 'livestream session';

          for (const activityEntry of nextLivestreamSessionMap.get(sortedEntry.livestreamSessionId)!.activities) {
            yield nextActivityMap.get(activityEntry.activityInternalId)!.activity;
          }
        }
      }
    })()
  );

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
    const currentActivityIdentifier = getActivityInternalId(currentActivity);
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
      const activityMapEntry = nextActivityMap.get(currentActivityIdentifier)!;

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

      nextActivityMap.set(currentActivityIdentifier, nextActivityEntry);

      nextSortedActivities[+index] = nextActivityEntry.activity;
    }

    lastPosition = nextPosition;
  }

  // #endregion

  console.log(
    Object.freeze({
      activityMap: nextActivityMap,
      howToGroupingMap: nextHowToGroupingMap,
      livestreamingSessionMap: nextLivestreamSessionMap,
      sortedActivities: nextSortedActivities,
      sortedChatHistoryList: nextSortedChatHistoryList
    })
  );

  return Object.freeze({
    activityMap: Object.freeze(nextActivityMap),
    howToGroupingMap: Object.freeze(nextHowToGroupingMap),
    livestreamingSessionMap: Object.freeze(nextLivestreamSessionMap),
    sortedActivities: Object.freeze(nextSortedActivities),
    sortedChatHistoryList: Object.freeze(nextSortedChatHistoryList)
  } satisfies State);
}

export default upsert;
export { INITIAL_STATE };
