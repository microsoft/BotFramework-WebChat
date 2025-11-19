import type { Tagged } from 'type-fest';
import type { WebChatActivity } from '../../../types/WebChatActivity';

type Activity = WebChatActivity;

type ActivityInternalIdentifier = Tagged<string, 'activity internal identifier'>;
type HowToGroupingIdentifier = Tagged<string, 'how to grouping identifier'>;
type LivestreamSessionIdentifier = Tagged<string, 'livestream session identifier'>;

type HowToGroupingEntry = {
  readonly howToGroupingId: HowToGroupingIdentifier;
  readonly logicalTimestamp: number | undefined;
  readonly type: 'how to grouping';
};

type LivestreamSessionEntry = {
  readonly livestreamSessionId: LivestreamSessionIdentifier;
  readonly logicalTimestamp: number | undefined;
  readonly type: 'livestream session';
};

type ActivityEntry = {
  readonly activityInternalId: ActivityInternalIdentifier;
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
type HowToGroupingMap = ReadonlyMap<HowToGroupingIdentifier, HowToGroupingMapEntry>;

type SortedChatHistoryEntry = ActivityEntry | LivestreamSessionEntry | HowToGroupingEntry;
type SortedChatHistory = readonly SortedChatHistoryEntry[];

type LivestreamSessionMapEntryActivityEntry = ActivityEntry & { readonly sequenceNumber: number };

type LivestreamSessionMapEntry = {
  readonly activities: readonly LivestreamSessionMapEntryActivityEntry[];
  readonly finalized: boolean;
  readonly logicalTimestamp: number | undefined;
};
type LivestreamSessionMap = ReadonlyMap<LivestreamSessionIdentifier, LivestreamSessionMapEntry>;

type ActivityMapEntry = ActivityEntry & { readonly activity: Activity };
type ActivityMap = ReadonlyMap<ActivityInternalIdentifier, ActivityMapEntry>;

type State = {
  readonly activityMap: ActivityMap;
  readonly howToGroupingMap: HowToGroupingMap;
  readonly livestreamingSessionMap: LivestreamSessionMap;
  readonly sortedChatHistoryList: SortedChatHistory;
  readonly sortedActivities: readonly Activity[];
};

export {
  type Activity,
  type ActivityEntry,
  type ActivityInternalIdentifier,
  type ActivityMap,
  type ActivityMapEntry,
  type HowToGroupingEntry,
  type HowToGroupingIdentifier,
  type HowToGroupingMap,
  type HowToGroupingMapEntry,
  type HowToGroupingMapPartEntry,
  type LivestreamSessionEntry,
  type LivestreamSessionIdentifier,
  type LivestreamSessionMap,
  type LivestreamSessionMapEntry,
  type LivestreamSessionMapEntryActivityEntry,
  type SortedChatHistory,
  type SortedChatHistoryEntry,
  type State
};
