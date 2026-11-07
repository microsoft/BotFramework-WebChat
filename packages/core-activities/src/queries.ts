import type { LocalId } from './property/LocalId';
import type {
  Activity,
  ActivitiesCoreState,
  HowToGroupingId,
  HowToGroupingMapEntry,
  LivestreamSessionId,
  LivestreamSessionMapEntry,
  SortedChatHistory
} from './types';

// Reads of a state. The state is immutable: a query on the same state returns the same objects.

/** The transcript: the activities to show, in order. */
function getActivities(state: ActivitiesCoreState): readonly Activity[] {
  return state.sortedActivities;
}

/** The activity with the local ID, as the host sent it (with core's `channelData`), if any. */
function getActivityByLocalId(state: ActivitiesCoreState, localId: LocalId): Activity | undefined {
  return state.activityMap.get(localId)?.activity;
}

/** The parts of a HowTo grouping, in `position` order, if any. */
function getHowToGrouping(
  state: ActivitiesCoreState,
  howToGroupingId: HowToGroupingId
): HowToGroupingMapEntry | undefined {
  return state.howToGroupingMap.get(howToGroupingId);
}

/** The revisions of a livestream session, if any. */
function getLivestreamSession(
  state: ActivitiesCoreState,
  livestreamSessionId: LivestreamSessionId
): LivestreamSessionMapEntry | undefined {
  return state.livestreamSessionMap.get(livestreamSessionId);
}

/** The top level of the transcript: activities, livestream sessions and HowTo groupings, in order. */
function getSortedChatHistory(state: ActivitiesCoreState): SortedChatHistory {
  return state.sortedChatHistoryList;
}

export { getActivities, getActivityByLocalId, getHowToGrouping, getLivestreamSession, getSortedChatHistory };
