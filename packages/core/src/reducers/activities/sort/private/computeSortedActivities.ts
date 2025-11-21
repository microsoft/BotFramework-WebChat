import type { Activity, State } from '../types';

export default function computeSortedActivities(temporalState: Omit<State, 'sortedActivities'>): Activity[] {
  const { activityMap, howToGroupingMap, livestreamSessionMap, sortedChatHistoryList } = temporalState;

  return Array.from<Activity>(
    (function* () {
      for (const sortedEntry of sortedChatHistoryList) {
        if (sortedEntry.type === 'activity') {
          // TODO: [P*] Instead of deferencing using internal ID, use pointer instead.
          yield activityMap.get(sortedEntry.activityInternalId)!.activity;
        } else if (sortedEntry.type === 'how to grouping') {
          const howToGrouping = howToGroupingMap.get(sortedEntry.howToGroupingId)!;

          for (const howToPartEntry of howToGrouping.partList) {
            if (howToPartEntry.type === 'activity') {
              yield activityMap.get(howToPartEntry.activityInternalId)!.activity;
            } else {
              howToPartEntry.type satisfies 'livestream session';

              for (const activityEntry of livestreamSessionMap.get(howToPartEntry.livestreamSessionId)!.activities) {
                yield activityMap.get(activityEntry.activityInternalId)!.activity;
              }
            }
          }
        } else {
          sortedEntry.type satisfies 'livestream session';

          for (const activityEntry of livestreamSessionMap.get(sortedEntry.livestreamSessionId)!.activities) {
            yield activityMap.get(activityEntry.activityInternalId)!.activity;
          }
        }
      }
    })()
  );
}
