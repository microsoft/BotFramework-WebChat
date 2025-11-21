import type { Tagged } from 'type-fest';
import type { WebChatActivity } from '../../../types/WebChatActivity';

type Activity = WebChatActivity;

type ActivityLocalId = Tagged<string, 'activity local id'>;
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
  readonly activityLocalId: ActivityLocalId;
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
type ActivityMap = ReadonlyMap<ActivityLocalId, ActivityMapEntry>;

type State = {
  readonly activityIdToLocalIdMap: Map<string, ActivityLocalId>;
  readonly activityMap: ActivityMap;
  readonly clientActivityIdToLocalIdMap: Map<string, ActivityLocalId>;
  readonly howToGroupingMap: HowToGroupingMap;
  readonly livestreamSessionMap: LivestreamSessionMap;
  readonly sortedChatHistoryList: SortedChatHistory;
  readonly sortedActivities: readonly Activity[];
};

export {
  type Activity,
  type ActivityEntry,
  type ActivityLocalId,
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
