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

  nextSortedChatHistoryList = nextSortedChatHistoryList.filter(entry => {
    if (entry.type === 'activity' && entry.activityInternalId === localId) {
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
