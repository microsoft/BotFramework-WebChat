import computePartListTimestamp from './private/computePartListTimestamp';
import computeSortedActivities from './private/computeSortedActivities';
import type { ActivityLocalId, LivestreamSessionMapEntry, State } from './types';

export default function deleteActivityByLocalId(state: State, localId: ActivityLocalId): State {
  const nextActivityIdToLocalIdMap = new Map(state.activityIdToLocalIdMap);
  const nextActivityMap = new Map(state.activityMap);
  const nextClientActivityIdToLocalIdMap = new Map(state.clientActivityIdToLocalIdMap);
  const nextHowToGroupingMap = new Map(state.howToGroupingMap);
  const nextLivestreamSessionMap = new Map(state.livestreamSessionMap);
  let nextSortedChatHistoryList = Array.from(state.sortedChatHistoryList);

  if (!nextActivityMap.delete(localId)) {
    throw new Error(`botframework-webchat: Cannot find activity with local ID "${localId}" to delete`);
  }

  for (const entry of nextActivityIdToLocalIdMap) {
    if (entry[1] === localId) {
      nextActivityIdToLocalIdMap.delete(entry[0]);

      break;
    }
  }

  for (const entry of nextClientActivityIdToLocalIdMap) {
    if (entry[1] === localId) {
      nextClientActivityIdToLocalIdMap.delete(entry[0]);

      break;
    }
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

        const sortedChatHistoryListIndex = nextSortedChatHistoryList.findIndex(
          entry => entry.type === 'how to grouping' && entry.howToGroupingId === howToGroupingId
        );

        ~sortedChatHistoryListIndex && nextSortedChatHistoryList.splice(sortedChatHistoryListIndex, 1);
      }
    }
  }

  for (const [livestreamSessionId, livestreamSessionMapEntry] of nextLivestreamSessionMap) {
    const activityIndex = livestreamSessionMapEntry.activities.findIndex(
      activity => activity.activityLocalId === localId
    );

    if (~activityIndex) {
      const nextActivities = Array.from(livestreamSessionMapEntry.activities);

      nextActivities.splice(activityIndex, 1);

      if (nextActivities.length) {
        // eslint-disable-next-line no-magic-numbers
        const lastActivity = nextActivities.at(-1);
        const finalActivity = lastActivity?.sequenceNumber === Infinity ? lastActivity : undefined;

        const logicalTimestamp = finalActivity
          ? // eslint-disable-next-line no-magic-numbers
            finalActivity.logicalTimestamp
          : nextActivities.at(0)?.logicalTimestamp;

        const nextLivestreamSessionMapEntry: LivestreamSessionMapEntry = {
          ...livestreamSessionMapEntry,
          activities: nextActivities,
          finalized: !!finalActivity,
          logicalTimestamp
        };

        nextLivestreamSessionMap.set(livestreamSessionId, nextLivestreamSessionMapEntry);

        for (const [howToGroupingId, entry] of nextHowToGroupingMap) {
          let changed = false;

          const nextPartList = entry.partList.map(part => {
            if (part.type === 'livestream session' && part.livestreamSessionId === livestreamSessionId) {
              changed = true;

              return { ...part, logicalTimestamp };
            }

            return part;
          });

          if (changed) {
            nextHowToGroupingMap.set(howToGroupingId, {
              ...entry,
              logicalTimestamp: computePartListTimestamp(nextPartList),
              partList: nextPartList
            });
          }
        }
      } else {
        nextLivestreamSessionMap.delete(livestreamSessionId);

        const sortedChatHistoryListIndex = nextSortedChatHistoryList.findIndex(
          entry => entry.type === 'livestream session' && entry.livestreamSessionId === livestreamSessionId
        );

        ~sortedChatHistoryListIndex && nextSortedChatHistoryList.splice(sortedChatHistoryListIndex, 1);

        for (const [howToGroupingId, entry] of nextHowToGroupingMap) {
          const partIndex = entry.partList.findIndex(
            part => part.type === 'livestream session' && part.livestreamSessionId === livestreamSessionId
          );

          if (~partIndex) {
            const nextPartList = Array.from(entry.partList);

            nextPartList.splice(partIndex, 1);

            nextHowToGroupingMap.set(howToGroupingId, {
              ...entry,
              logicalTimestamp: computePartListTimestamp(nextPartList),
              partList: nextPartList
            });
          }
        }
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
    activityIdToLocalIdMap: Object.freeze(nextActivityIdToLocalIdMap),
    activityMap: Object.freeze(nextActivityMap),
    clientActivityIdToLocalIdMap: Object.freeze(nextClientActivityIdToLocalIdMap),
    howToGroupingMap: Object.freeze(nextHowToGroupingMap),
    livestreamSessionMap: Object.freeze(nextLivestreamSessionMap),
    sortedActivities: Object.freeze(nextSortedActivities),
    sortedChatHistoryList: Object.freeze(nextSortedChatHistoryList)
  } satisfies State);
}
