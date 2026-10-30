import type { Tagged } from 'type-fest';
import type { WebChatActivity } from '../../../types/WebChatActivity';
import type { ActivitiesGraph } from './graph/createActivitiesGraph';
import type { GraphJournal } from './graph/private/graphJournal';
import type { PartIndex } from './graph/private/WorkingGraph';
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
  readonly activityIdToLocalIdMap: Map<string, LocalId>;
  readonly activityMap: ActivityMap;
  readonly clientActivityIdToLocalIdMap: Map<string, LocalId>;
  /**
   * The source of truth: William's store holding the activities graph. The other fields are derived from it.
   * `undefined` until the first activity.
   */
  readonly graph: ActivitiesGraph | undefined;
  /** `graph.version` this state was derived at. If the graph moved on (replay, failed edit), the graph is rebuilt. */
  readonly graphVersion: number;
  /**
   * The changes of every transaction since the graph was created, newest first, shared between states (each state adds
   * one link). Needed while William's store has mutable snapshots and no rollback: it lets core rebuild the graph as
   * this state saw it (replay, or after a failed edit).
   */
  readonly graphJournal: GraphJournal | undefined;
  /** Parts of each grouping, conversation and livestream session, in `position` order. */
  readonly graphPartIndex: PartIndex;
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
