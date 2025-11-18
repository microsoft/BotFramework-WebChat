/* eslint-disable complexity */
import type { GlobalScopePonyfill } from '../../types/GlobalScopePonyfill';
import getActivityLivestreamingMetadata from '../../utils/getActivityLivestreamingMetadata';
import getActivityInternalId from './private/getActivityInternalId';
import getLogicalTimestamp from './private/getLogicalTimestamp';
import getPartGroupingMetadataMap from './private/getPartGroupingMetadataMap';
import insertSorted from './private/insertSorted';
import {
  type Activity,
  type ActivityEntry,
  type ActivityMapEntry,
  type HowToGroupingIdentifier,
  type HowToGroupingMapEntry,
  type LivestreamSessionIdentifier,
  type LivestreamSessionMapEntry,
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

function upsert(ponyfill: Pick<GlobalScopePonyfill, 'Date'>, state: State, activity: Activity): State {
  const nextActivityMap = new Map(state.activityMap);
  const nextLivestreamSessionMap = new Map(state.livestreamingSessionMap);
  const nextHowToGroupingMap = new Map(state.howToGroupingMap);
  let nextSortedChatHistoryList = Array.from(state.sortedChatHistoryList);

  const activityInternalId = getActivityInternalId(activity);
  const logicalTimestamp = getLogicalTimestamp(activity, ponyfill);

  nextActivityMap.set(activityInternalId, {
    activity,
    activityInternalId,
    logicalTimestamp,
    type: 'activity'
  });

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
      (nextLivestreamingSession?.finalized ?? false) || activityLivestreamingMetadata.type === 'final activity';

    const nextLivestreamingSessionMapEntry = Object.freeze({
      activities: Object.freeze(
        insertSorted<ActivityEntry>(
          nextLivestreamingSession?.activities ?? [],
          {
            activityInternalId,
            logicalTimestamp,
            type: 'activity'
          },
          ({ logicalTimestamp: x }, { logicalTimestamp: y }) =>
            typeof x === 'undefined' || typeof y === 'undefined'
              ? // eslint-disable-next-line no-magic-numbers
                -1
              : x - y
        )
      ),
      finalized,
      logicalTimestamp: finalized ? logicalTimestamp : (nextLivestreamingSession?.logicalTimestamp ?? logicalTimestamp)
    } satisfies LivestreamSessionMapEntry);

    nextLivestreamSessionMap.set(sessionId, nextLivestreamingSessionMapEntry);

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

    const nextPartGroupingEntry: HowToGroupingMapEntry =
      nextHowToGroupingMap.get(howToGroupingId) ??
      Object.freeze({ logicalTimestamp, partList: Object.freeze([]) } satisfies HowToGroupingMapEntry);

    let nextPartList = Array.from(nextPartGroupingEntry.partList);

    const existingPartEntryIndex = nextPartList.findIndex(entry => entry.position === howToGrouping.position);

    ~existingPartEntryIndex && nextPartList.splice(existingPartEntryIndex, 1);

    nextPartList = insertSorted(
      nextPartList,
      Object.freeze({ ...sortedChatHistoryListEntry, position: howToGrouping.position }),
      // eslint-disable-next-line no-magic-numbers
      ({ position: x }, { position: y }) => (typeof x === 'undefined' || typeof y === 'undefined' ? -1 : x - y)
    );

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

  ~existingSortedChatHistoryListEntryIndex &&
    nextSortedChatHistoryList.splice(existingSortedChatHistoryListEntryIndex, 1);

  nextSortedChatHistoryList = insertSorted(
    nextSortedChatHistoryList,
    sortedChatHistoryListEntry,
    ({ logicalTimestamp: x }, { logicalTimestamp: y }) =>
      // eslint-disable-next-line no-magic-numbers
      typeof x === 'undefined' || typeof y === 'undefined' ? -1 : x - y
  );

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

  // #region Position map

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

      const nextActivityEntry: ActivityMapEntry = {
        ...activityMapEntry,
        activity: {
          ...activityMapEntry.activity,
          channelData: {
            ...activityMapEntry.activity.channelData,
            'webchat:internal:position': nextPosition
          } as any
        }
      };

      nextActivityMap.set(currentActivityIdentifier, nextActivityEntry);

      nextSortedActivities[+index] = nextActivityEntry.activity;
    }

    lastPosition = nextPosition;
  }

  // #endregion

  return Object.freeze({
    activityMap: nextActivityMap,
    howToGroupingMap: nextHowToGroupingMap,
    livestreamingSessionMap: nextLivestreamSessionMap,
    sortedActivities: Object.freeze(nextSortedActivities),
    sortedChatHistoryList: nextSortedChatHistoryList
  } satisfies State);
}

export default upsert;
export { INITIAL_STATE };
