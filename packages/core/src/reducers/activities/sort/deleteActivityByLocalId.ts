import computePartListTimestamp from './private/computePartListTimestamp';
import computeSortedActivities from './private/computeSortedActivities';
import type { ActivityLocalId, State } from './types';

export default function deleteActivityByLocalId(state: State, localId: ActivityLocalId): State {
  const nextActivityMap = new Map(state.activityMap);
  const nextHowToGroupingMap = new Map(state.howToGroupingMap);
  const nextLivestreamSessionMap = new Map(state.livestreamSessionMap);
  let nextSortedChatHistoryList = Array.from(state.sortedChatHistoryList);

  if (!nextActivityMap.delete(localId)) {
    throw new Error(`botframework-webchat: Cannot find activity with local ID "${localId}" to delete`);
  }

  for (const [howToGroupingId, entry] of nextHowToGroupingMap) {
    const partIndex = entry.partList.findIndex(part => part.type === 'activity' && part.activityLocalId === localId);

    if (~partIndex) {
      const nextPartList = Array.from(entry.partList);

      nextPartList.splice(partIndex, 1);

      if (nextPartList.length) {
        const nextHowToGroupingMapEntry = Object.freeze({
          ...entry,
          logicalTimestamp: computePartListTimestamp(nextPartList),
          partList: Object.freeze(nextPartList)
        });

        nextHowToGroupingMap.set(howToGroupingId, nextHowToGroupingMapEntry);

        nextSortedChatHistoryList = nextSortedChatHistoryList.map(entry => {
          if (entry.type === 'how to grouping' && entry.howToGroupingId === howToGroupingId) {
            return {
              howToGroupingId,
              logicalTimestamp: nextHowToGroupingMapEntry.logicalTimestamp,
              type: 'how to grouping'
            };
          }

          return entry;
        });
      } else {
        nextHowToGroupingMap.delete(howToGroupingId);
        nextSortedChatHistoryList = nextSortedChatHistoryList.filter(
          entry => !(entry.type === 'how to grouping' && entry.howToGroupingId === howToGroupingId)
        );
      }
    }
  }

  nextSortedChatHistoryList = nextSortedChatHistoryList.filter(entry => {
    if (entry.type === 'activity' && entry.activityLocalId === localId) {
      return false;
    }

    return true;
  });

  const nextSortedActivities = computeSortedActivities({
    activityMap: nextActivityMap,
    howToGroupingMap: nextHowToGroupingMap,
    livestreamSessionMap: nextLivestreamSessionMap,
    sortedChatHistoryList: nextSortedChatHistoryList
  });

  return Object.freeze({
    activityMap: Object.freeze(nextActivityMap),
    howToGroupingMap: Object.freeze(nextHowToGroupingMap),
    livestreamSessionMap: Object.freeze(nextLivestreamSessionMap),
    sortedActivities: Object.freeze(nextSortedActivities),
    sortedChatHistoryList: Object.freeze(nextSortedChatHistoryList)
  } satisfies State);
}
