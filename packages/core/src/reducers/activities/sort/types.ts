import type { Tagged } from 'type-fest';
import type { WebChatActivity } from '../../../types/WebChatActivity';
import type { ActivitiesGraph } from './graph/createActivitiesGraph';
import type { ActivityTable, PartIndex } from './graph/private/WorkingGraph';
import type { GraphNode } from './graph/types';
import type { LocalId } from './property/LocalId';

type Activity = WebChatActivity;

type HowToGroupingId = Tagged<string, 'how to grouping id'>;
type LivestreamSessionId = Tagged<string, 'livestream session id'>;

type HowToGroupingEntry = {
  readonly howToGroupingId: HowToGroupingId;
  readonly logicalTimestamp: number | undefined;
  readonly type: 'how to grouping';
};

type LivestreamSessionEntry = {
  readonly livestreamSessionId: LivestreamSessionId;
  readonly logicalTimestamp: number | undefined;
  readonly type: 'livestream session';
};

type ActivityEntry = {
  readonly activityLocalId: LocalId;
  readonly logicalTimestamp: number | undefined;
  readonly type: 'activity';
};

type HowToGroupingMapPartEntry = (ActivityEntry | LivestreamSessionEntry) & {
  readonly position: number | undefined;
};
type HowToGroupingMapEntry = {
  readonly logicalTimestamp: number | undefined;
  readonly partList: readonly HowToGroupingMapPartEntry[];
};
type HowToGroupingMap = ReadonlyMap<HowToGroupingId, HowToGroupingMapEntry>;

type SortedChatHistoryEntry = ActivityEntry | LivestreamSessionEntry | HowToGroupingEntry;
type SortedChatHistory = readonly SortedChatHistoryEntry[];

type LivestreamSessionMapEntryActivityEntry = ActivityEntry & { readonly sequenceNumber: number };

type LivestreamSessionMapEntry = {
  readonly activities: readonly LivestreamSessionMapEntryActivityEntry[];
  readonly finalized: boolean;
  readonly logicalTimestamp: number | undefined;
};
type LivestreamSessionMap = ReadonlyMap<LivestreamSessionId, LivestreamSessionMapEntry>;

type ActivityMapEntry = ActivityEntry & { readonly activity: Activity };
type ActivityMap = ReadonlyMap<LocalId, ActivityMapEntry>;

type State = {
  readonly activityIdToLocalIdMap: ReadonlyMap<string, LocalId>;
  readonly activityMap: ActivityMap;
  readonly clientActivityIdToLocalIdMap: ReadonlyMap<string, LocalId>;
  /**
   * The source of truth: William's store holding the activities graph. The other fields are derived from it.
   * `undefined` until the first activity.
   */
  readonly graph: ActivitiesGraph | undefined;
  /**
   * The activity of each message node (by local ID), as the host sent it, with core's `channelData` (local ID,
   * position), without the send status (on the node). The store only holds JSON (`Date`, functions and object identity
   * are not kept), so the node holds a JSON literal of it and core outputs this one, as before the store.
   */
  readonly graphActivities: ActivityTable;
  /** Parts of each grouping, conversation and livestream session, in `position` order. */
  readonly graphPartIndex: PartIndex;
  /**
   * The store's (immutable) snapshot this state was derived from. If the store has committed since (an older state is
   * reduced again, e.g. replay), the graph is rebuilt from this snapshot.
   */
  readonly graphSnapshot: ReadonlyMap<string, GraphNode> | undefined;
  readonly howToGroupingMap: HowToGroupingMap;
  readonly livestreamSessionMap: LivestreamSessionMap;
  readonly sortedChatHistoryList: SortedChatHistory;
  readonly sortedActivities: readonly Activity[];
};

export {
  type Activity,
  type ActivityEntry,
  type ActivityMap,
  type ActivityMapEntry,
  type HowToGroupingEntry,
  type HowToGroupingId,
  type HowToGroupingMap,
  type HowToGroupingMapEntry,
  type HowToGroupingMapPartEntry,
  type LivestreamSessionEntry,
  type LivestreamSessionId,
  type LivestreamSessionMap,
  type LivestreamSessionMapEntry,
  type LivestreamSessionMapEntryActivityEntry,
  type SortedChatHistory,
  type SortedChatHistoryEntry,
  type State
};
