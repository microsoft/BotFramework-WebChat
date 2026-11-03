import type { Activity, LivestreamSessionMap, State } from '../types';

function* yieldSessionActivities(
  session: NonNullable<ReturnType<LivestreamSessionMap['get']>>,
  activityMap: State['activityMap']
): Generator<Activity> {
  if (session.finalized) {
    // After finalization, only yield the final revision — intermediate revisions are pruned.
    // eslint-disable-next-line no-magic-numbers
    const lastEntry = session.activities.at(-1);

    lastEntry && (yield activityMap.get(lastEntry.activityLocalId)!.activity);
  } else {
    for (const activityEntry of session.activities) {
      yield activityMap.get(activityEntry.activityLocalId)!.activity;
    }
  }
}

export default function computeSortedActivities(
  temporalState: Pick<State, 'activityMap' | 'howToGroupingMap' | 'livestreamSessionMap' | 'sortedChatHistoryList'>
): Activity[] {
  const { activityMap, howToGroupingMap, livestreamSessionMap, sortedChatHistoryList } = temporalState;

  return Array.from<Activity>(
    (function* () {
      for (const sortedEntry of sortedChatHistoryList) {
        if (sortedEntry.type === 'activity') {
          // TODO: [P*] Instead of deferencing using internal ID, use pointer instead.
          yield activityMap.get(sortedEntry.activityLocalId)!.activity;
        } else if (sortedEntry.type === 'how to grouping') {
          const howToGrouping = howToGroupingMap.get(sortedEntry.howToGroupingId)!;

          for (const howToPartEntry of howToGrouping.partList) {
            if (howToPartEntry.type === 'activity') {
              yield activityMap.get(howToPartEntry.activityLocalId)!.activity;
            } else {
              howToPartEntry.type satisfies 'livestream session';

              yield* yieldSessionActivities(livestreamSessionMap.get(howToPartEntry.livestreamSessionId)!, activityMap);
            }
          }
        } else {
          sortedEntry.type satisfies 'livestream session';

          yield* yieldSessionActivities(livestreamSessionMap.get(sortedEntry.livestreamSessionId)!, activityMap);
        }
      }
    })()
  );
}
