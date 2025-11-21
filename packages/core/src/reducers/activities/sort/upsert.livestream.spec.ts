/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../../types/WebChatActivity';
import {
  type Activity,
  type ActivityLocalId,
  type ActivityMapEntry,
  type LivestreamSessionId,
  type LivestreamSessionMapEntry,
  type LivestreamSessionMapEntryActivityEntry,
  type SortedChatHistory,
  type SortedChatHistoryEntry
} from './types';
import upsert, { INITIAL_STATE } from './upsert';
import deleteActivityByLocalId from './deleteActivityByLocalId';
import getActivityLocalId from './private/getActivityLocalId';

function activityToExpectation(activity: Activity, expectedPosition: number = expect.any(Number) as any): Activity {
  return {
    ...activity,
    channelData: {
      ...activity.channelData,
      'webchat:internal:position': expectedPosition
    } as any
  };
}

function buildActivity(
  activity:
    | {
        channelData:
          | {
              streamId: string;
              streamSequence?: never;
              streamType: 'final';
            }
          | undefined;
        id: string;
        text: string;
        timestamp: string;
        type: 'message';
      }
    | {
        channelData:
          | {
              streamId: string;
              streamSequence: number;
              streamType: 'informative' | 'streaming';
            }
          | {
              streamId?: never;
              streamSequence: 1;
              streamType: 'informative' | 'streaming';
            }
          | undefined;
        id: string;
        text: string;
        timestamp: string;
        type: 'typing';
      }
): WebChatActivity {
  const { id } = activity;

  return {
    from: { id: 'bot', role: 'bot' },
    ...activity,
    channelData: {
      'webchat:internal:local-id': id,
      'webchat:internal:position': 0,
      'webchat:send-status': undefined,
      ...activity.channelData
    }
  } as any;
}

scenario('upserting a livestream session', bdd => {
  const activity1 = buildActivity({
    channelData: {
      streamSequence: 1,
      streamType: 'streaming'
    },
    id: 'a-00001',
    text: 'A quick',
    timestamp: new Date(1_000).toISOString(),
    type: 'typing'
  });

  const activity2 = buildActivity({
    channelData: {
      streamId: 'a-00001',
      streamSequence: 3, // In reversed order.
      streamType: 'streaming'
    },
    id: 'a-00002',
    text: 'A quick brown fox jumped over',
    timestamp: new Date(3_000).toISOString(),
    type: 'typing'
  });

  const activity3 = buildActivity({
    channelData: {
      streamId: 'a-00001',
      streamSequence: 2,
      streamType: 'streaming'
    },
    id: 'a-00003',
    text: 'A quick brown fox',
    timestamp: new Date(2_000).toISOString(),
    type: 'typing'
  });

  const activity4 = buildActivity({
    channelData: {
      streamId: 'a-00001',
      streamType: 'final'
    },
    id: 'a-00004',
    text: 'A quick brown fox jumped over the lazy dogs.',
    timestamp: new Date(4_000).toISOString(),
    type: 'message'
  });

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('upserted', state => upsert({ Date }, state, activity1))
    .then('should have added to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<ActivityLocalId, ActivityMapEntry>([
          [
            'a-00001' as ActivityLocalId,
            {
              activity: activityToExpectation(activity1),
              activityLocalId: 'a-00001' as ActivityLocalId,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added to `livestreamSessions`', (_, state) => {
      expect(state.livestreamSessionMap).toEqual(
        new Map<LivestreamSessionId, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionId,
            {
              activities: [
                {
                  activityLocalId: 'a-00001' as ActivityLocalId,
                  logicalTimestamp: 1_000,
                  sequenceNumber: 1,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry
              ],
              finalized: false,
              logicalTimestamp: 1_000
            }
          ]
        ])
      );
    })
    .and('should have added to `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          livestreamSessionId: 'a-00001' as LivestreamSessionId,
          logicalTimestamp: 1_000,
          type: 'livestream session'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([activityToExpectation(activity1, 1_000)]);
    })
    .when('the second activity is upserted', (_, state) => upsert({ Date }, state, activity2))
    .then('should have added to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<ActivityLocalId, ActivityMapEntry>([
          [
            'a-00001' as ActivityLocalId,
            {
              activity: activityToExpectation(activity1),
              activityLocalId: 'a-00001' as ActivityLocalId,
              logicalTimestamp: 1_000,
              type: 'activity'
            } satisfies ActivityMapEntry
          ],
          [
            'a-00002' as ActivityLocalId,
            {
              activity: activityToExpectation(activity2),
              activityLocalId: 'a-00002' as ActivityLocalId,
              logicalTimestamp: 3_000,
              type: 'activity'
            } satisfies ActivityMapEntry
          ]
        ])
      );
    })
    .and('should have added to `livestreamSessions`', (_, state) => {
      expect(state.livestreamSessionMap).toEqual(
        new Map<LivestreamSessionId, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionId,
            {
              activities: [
                {
                  activityLocalId: 'a-00001' as ActivityLocalId,
                  logicalTimestamp: 1_000,
                  sequenceNumber: 1,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry,
                {
                  activityLocalId: 'a-00002' as ActivityLocalId,
                  logicalTimestamp: 3_000,
                  sequenceNumber: 3,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry
              ],
              finalized: false,
              logicalTimestamp: 1_000
            }
          ]
        ])
      );
    })
    .and('should not modify `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          livestreamSessionId: 'a-00001' as LivestreamSessionId,
          logicalTimestamp: 1_000,
          type: 'livestream session'
        } satisfies SortedChatHistoryEntry
      ]);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([
        activityToExpectation(activity1, 1_000),
        activityToExpectation(activity2, 2_000)
      ]);
    })
    .when('the third activity is upserted', (_, state) => upsert({ Date }, state, activity3))
    .then('should have added to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<ActivityLocalId, ActivityMapEntry>([
          [
            'a-00001' as ActivityLocalId,
            {
              activity: activityToExpectation(activity1),
              activityLocalId: 'a-00001' as ActivityLocalId,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            'a-00003' as ActivityLocalId,
            {
              activity: activityToExpectation(activity3),
              activityLocalId: 'a-00003' as ActivityLocalId,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            'a-00002' as ActivityLocalId,
            {
              activity: activityToExpectation(activity2),
              activityLocalId: 'a-00002' as ActivityLocalId,
              logicalTimestamp: 3_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added to `livestreamSessions`', (_, state) => {
      expect(state.livestreamSessionMap).toEqual(
        new Map<LivestreamSessionId, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionId,
            {
              activities: [
                {
                  activityLocalId: 'a-00001' as ActivityLocalId,
                  logicalTimestamp: 1_000,
                  sequenceNumber: 1,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry,
                {
                  activityLocalId: 'a-00003' as ActivityLocalId,
                  logicalTimestamp: 2_000,
                  sequenceNumber: 2,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry,
                {
                  activityLocalId: 'a-00002' as ActivityLocalId,
                  logicalTimestamp: 3_000,
                  sequenceNumber: 3,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry
              ],
              finalized: false,
              logicalTimestamp: 1_000
            }
          ]
        ])
      );
    })
    .and('should update `sortedChatHistoryList` with updated timestamp', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          livestreamSessionId: 'a-00001' as LivestreamSessionId,
          logicalTimestamp: 1_000,
          type: 'livestream session'
        } satisfies SortedChatHistoryEntry
      ]);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([
        activityToExpectation(activity1, 1_000),
        activityToExpectation(activity3, 1_001),
        activityToExpectation(activity2, 2_000)
      ]);
    })
    .when('the fourth and final activity is upserted', (_, state) => upsert({ Date }, state, activity4))
    .then('should have added to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<ActivityLocalId, ActivityMapEntry>([
          [
            'a-00001' as ActivityLocalId,
            {
              activity: activityToExpectation(activity1),
              activityLocalId: 'a-00001' as ActivityLocalId,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            'a-00003' as ActivityLocalId,
            {
              activity: activityToExpectation(activity3),
              activityLocalId: 'a-00003' as ActivityLocalId,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            'a-00002' as ActivityLocalId,
            {
              activity: activityToExpectation(activity2),
              activityLocalId: 'a-00002' as ActivityLocalId,
              logicalTimestamp: 3_000,
              type: 'activity'
            }
          ],
          [
            'a-00004' as ActivityLocalId,
            {
              activity: activityToExpectation(activity4),
              activityLocalId: 'a-00004' as ActivityLocalId,
              logicalTimestamp: 4_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added to `livestreamSessions`', (_, state) => {
      expect(state.livestreamSessionMap).toEqual(
        new Map<LivestreamSessionId, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionId,
            {
              activities: [
                {
                  activityLocalId: 'a-00001' as ActivityLocalId,
                  logicalTimestamp: 1_000,
                  sequenceNumber: 1,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry,
                {
                  activityLocalId: 'a-00003' as ActivityLocalId,
                  logicalTimestamp: 2_000,
                  sequenceNumber: 2,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry,
                {
                  activityLocalId: 'a-00002' as ActivityLocalId,
                  logicalTimestamp: 3_000,
                  sequenceNumber: 3,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry,
                {
                  activityLocalId: 'a-00004' as ActivityLocalId,
                  logicalTimestamp: 4_000,
                  sequenceNumber: Infinity,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry
              ],
              finalized: true,
              logicalTimestamp: 4_000
            }
          ]
        ])
      );
    })
    .and('should update `sortedChatHistoryList` with updated timestamp', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          livestreamSessionId: 'a-00001' as LivestreamSessionId,
          logicalTimestamp: 4_000,
          type: 'livestream session'
        } satisfies SortedChatHistoryEntry
      ]);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([
        activityToExpectation(activity1, 1_000),
        activityToExpectation(activity3, 1_001),
        activityToExpectation(activity2, 2_000),
        activityToExpectation(activity4, 3_000)
      ]);
    });
});

scenario('deleting an activity', bdd => {
  const activity1 = buildActivity({
    channelData: {
      streamSequence: 1,
      streamType: 'streaming'
    },
    id: 'a-00001',
    text: 'A quick',
    timestamp: new Date(1_000).toISOString(),
    type: 'typing'
  });

  const activity2 = buildActivity({
    channelData: {
      streamId: 'a-00001',
      streamSequence: 2,
      streamType: 'streaming'
    },
    id: 'a-00002',
    text: 'A quick brown fox',
    timestamp: new Date(2_000).toISOString(),
    type: 'typing'
  });

  const activity3 = buildActivity({
    channelData: {
      streamId: 'a-00001',
      streamType: 'final'
    },
    id: 'a-00003',
    text: 'A quick brown fox jumped over the lazy dogs.',
    timestamp: new Date(3_000).toISOString(),
    type: 'message'
  });

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('3 activities are upserted', state =>
      upsert({ Date }, upsert({ Date }, upsert({ Date }, state, activity1), activity2), activity3)
    )
    .then('should have 3 activities', (_, state) => {
      expect(state.activityMap).toHaveProperty('size', 3);
      expect(state.howToGroupingMap).toHaveProperty('size', 0);
      expect(state.livestreamSessionMap).toHaveProperty('size', 1);
      expect(state.sortedActivities).toHaveLength(3);
      expect(state.sortedChatHistoryList).toHaveLength(1);
    })
    .when('the last activity is delete', (_, state) =>
      deleteActivityByLocalId(state, getActivityLocalId(state.sortedActivities[2]))
    )
    .then('should have 2 activities', (_, state) => {
      expect(state.activityMap).toHaveProperty('size', 2);
      expect(state.howToGroupingMap).toHaveProperty('size', 0);
      expect(state.livestreamSessionMap).toHaveProperty('size', 1);
      expect(state.sortedActivities).toHaveLength(2);
      expect(state.sortedChatHistoryList).toHaveLength(1);
    })
    .and('`livestreamSessionMap` should match', (_, state) => {
      expect(state.livestreamSessionMap).toEqual(
        new Map([
          [
            'a-00001',
            {
              activities: [
                {
                  activityLocalId: 'a-00001' as ActivityLocalId,
                  logicalTimestamp: 1_000,
                  sequenceNumber: 1,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry,
                {
                  activityLocalId: 'a-00002' as ActivityLocalId,
                  logicalTimestamp: 2_000,
                  sequenceNumber: 2,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry
              ],
              finalized: false,
              logicalTimestamp: 1_000
            } satisfies LivestreamSessionMapEntry
          ]
        ])
      );
    })
    .when('all activities are delete', (_, state) =>
      deleteActivityByLocalId(
        deleteActivityByLocalId(state, getActivityLocalId(state.sortedActivities[1])),
        getActivityLocalId(state.sortedActivities[0])
      )
    )
    .then('should have no activities', (_, state) => {
      expect(state.activityMap).toHaveProperty('size', 0);
      expect(state.howToGroupingMap).toHaveProperty('size', 0);
      expect(state.livestreamSessionMap).toHaveProperty('size', 0);
      expect(state.sortedActivities).toHaveLength(0);
      expect(state.sortedChatHistoryList).toHaveLength(0);
    });
});
