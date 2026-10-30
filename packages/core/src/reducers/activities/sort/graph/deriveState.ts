import type { LocalId } from '../property/LocalId';
import type {
  Activity,
  ActivityMapEntry,
  HowToGroupingId,
  HowToGroupingMapEntry,
  HowToGroupingMapPartEntry,
  LivestreamSessionId,
  LivestreamSessionMapEntry,
  LivestreamSessionMapEntryActivityEntry,
  SortedChatHistoryEntry,
  State
} from '../types';
import { CONVERSATION_ID, type ActivitiesGraph } from './createActivitiesGraph';
import getSortedMessages from './getSortedMessages';
import getOrderedParts from './private/getOrderedParts';
import { getActivity, getBoolean, getIdentifier, getNumber, hasType } from './private/nodeProperties';
import type { GraphNode } from './types';
import {
  FINALIZED,
  HOW_TO_TYPE,
  LIVESTREAM_SESSION_TYPE,
  LOGICAL_TIMESTAMP,
  PART_POSITION,
  STREAM_SEQUENCE
} from './vocabulary';

/**
 * Derives core's `State` from the graph: the graph is the source of truth, `State` is a read model kept for the
 * reducer, its selectors and `state.activities`.
 */
export default function deriveState(graph: ActivitiesGraph): State {
  const snapshot = graph.store.getSnapshot();
  const getNode = (id: string) => snapshot.get(id);

  const activityIdToLocalIdMap = new Map<string, LocalId>();
  const activityMap = new Map<LocalId, ActivityMapEntry>();
  const clientActivityIdToLocalIdMap = new Map<string, LocalId>();
  const howToGroupingMap = new Map<HowToGroupingId, HowToGroupingMapEntry>();
  const livestreamSessionMap = new Map<LivestreamSessionId, LivestreamSessionMapEntry>();
  const sortedChatHistoryList: SortedChatHistoryEntry[] = [];

  const addActivity = (node: GraphNode): LocalId | undefined => {
    const activity = getActivity(node);

    if (!activity) {
      return undefined;
    }

    const activityLocalId = node['@id'] satisfies string as LocalId;
    const { clientActivityID } = activity.channelData;

    typeof activity.id !== 'undefined' && activityIdToLocalIdMap.set(activity.id, activityLocalId);
    typeof clientActivityID !== 'undefined' && clientActivityIdToLocalIdMap.set(clientActivityID, activityLocalId);

    activityMap.set(
      activityLocalId,
      Object.freeze({
        activity,
        activityLocalId,
        logicalTimestamp: getNumber(node, LOGICAL_TIMESTAMP),
        type: 'activity'
      })
    );

    return activityLocalId;
  };

  const addSession = (session: GraphNode): LivestreamSessionId => {
    const livestreamSessionId = (getIdentifier(session) ?? session['@id']) satisfies string as LivestreamSessionId;
    const activities: LivestreamSessionMapEntryActivityEntry[] = [];

    for (const revision of getOrderedParts(getNode, session['@id'])) {
      const activityLocalId = addActivity(revision);

      activityLocalId &&
        activities.push(
          Object.freeze({
            activityLocalId,
            logicalTimestamp: getNumber(revision, LOGICAL_TIMESTAMP),
            // The final revision has no sequence number.
            sequenceNumber: getNumber(revision, STREAM_SEQUENCE) ?? Infinity,
            type: 'activity'
          })
        );
    }

    livestreamSessionMap.set(
      livestreamSessionId,
      Object.freeze({
        activities: Object.freeze(activities),
        finalized: getBoolean(session, FINALIZED),
        logicalTimestamp: getNumber(session, LOGICAL_TIMESTAMP)
      })
    );

    return livestreamSessionId;
  };

  for (const part of getOrderedParts(getNode, CONVERSATION_ID)) {
    const logicalTimestamp = getNumber(part, LOGICAL_TIMESTAMP);

    if (hasType(part, LIVESTREAM_SESSION_TYPE)) {
      sortedChatHistoryList.push(
        Object.freeze({ livestreamSessionId: addSession(part), logicalTimestamp, type: 'livestream session' })
      );
    } else if (hasType(part, HOW_TO_TYPE)) {
      const howToGroupingId = (getIdentifier(part) ?? part['@id']) satisfies string as HowToGroupingId;
      const partList: HowToGroupingMapPartEntry[] = [];

      for (const howToPart of getOrderedParts(getNode, part['@id'])) {
        const position = getNumber(howToPart, PART_POSITION);
        const partLogicalTimestamp = getNumber(howToPart, LOGICAL_TIMESTAMP);

        if (hasType(howToPart, LIVESTREAM_SESSION_TYPE)) {
          partList.push(
            Object.freeze({
              livestreamSessionId: addSession(howToPart),
              logicalTimestamp: partLogicalTimestamp,
              position,
              type: 'livestream session'
            })
          );
        } else {
          const activityLocalId = addActivity(howToPart);

          activityLocalId &&
            partList.push(
              Object.freeze({ activityLocalId, logicalTimestamp: partLogicalTimestamp, position, type: 'activity' })
            );
        }
      }

      howToGroupingMap.set(howToGroupingId, Object.freeze({ logicalTimestamp, partList: Object.freeze(partList) }));
      sortedChatHistoryList.push(Object.freeze({ howToGroupingId, logicalTimestamp, type: 'how to grouping' }));
    } else {
      const activityLocalId = addActivity(part);

      activityLocalId &&
        sortedChatHistoryList.push(Object.freeze({ activityLocalId, logicalTimestamp, type: 'activity' }));
    }
  }

  const sortedActivities = getSortedMessages(getNode, CONVERSATION_ID)
    .map(getActivity)
    .filter((activity): activity is Activity => !!activity);

  return Object.freeze({
    activityIdToLocalIdMap: Object.freeze(activityIdToLocalIdMap),
    activityMap: Object.freeze(activityMap),
    clientActivityIdToLocalIdMap: Object.freeze(clientActivityIdToLocalIdMap),
    graph,
    howToGroupingMap: Object.freeze(howToGroupingMap),
    livestreamSessionMap: Object.freeze(livestreamSessionMap),
    sortedActivities: Object.freeze(sortedActivities),
    sortedChatHistoryList: Object.freeze(sortedChatHistoryList)
  } satisfies State);
}
