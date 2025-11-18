/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../types/WebChatActivity';
import {
  type Activity,
  type ActivityInternalIdentifier,
  type ActivityMapEntry,
  type LivestreamSessionIdentifier,
  type LivestreamSessionMapEntry,
  type SortedChatHistory,
  type SortedChatHistoryEntry
} from './types';
import upsert, { INITIAL_STATE } from './upsert';

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
      'webchat:internal:id': id,
      'webchat:internal:position': 0,
      'webchat:send-status': undefined,
      ...activity.channelData
    }
  } as any;
}

scenario('upserting a livestreaming session', bdd => {
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
        new Map<ActivityInternalIdentifier, ActivityMapEntry>([
          [
            'a-00001' as ActivityInternalIdentifier,
            {
              activity: activityToExpectation(activity1),
              activityInternalId: 'a-00001' as ActivityInternalIdentifier,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added to `livestreamSessions`', (_, state) => {
      expect(state.livestreamingSessionMap).toEqual(
        new Map<LivestreamSessionIdentifier, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionIdentifier,
            {
              activities: [
                {
                  activityInternalId: 'a-00001' as ActivityInternalIdentifier,
                  logicalTimestamp: 1_000,
                  type: 'activity'
                }
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
          livestreamSessionId: 'a-00001' as LivestreamSessionIdentifier,
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
        new Map<ActivityInternalIdentifier, ActivityMapEntry>([
          [
            'a-00001' as ActivityInternalIdentifier,
            {
              activity: activityToExpectation(activity1),
              activityInternalId: 'a-00001' as ActivityInternalIdentifier,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            'a-00002' as ActivityInternalIdentifier,
            {
              activity: activityToExpectation(activity2),
              activityInternalId: 'a-00002' as ActivityInternalIdentifier,
              logicalTimestamp: 3_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added to `livestreamSessions`', (_, state) => {
      expect(state.livestreamingSessionMap).toEqual(
        new Map<LivestreamSessionIdentifier, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionIdentifier,
            {
              activities: [
                {
                  activityInternalId: 'a-00001' as ActivityInternalIdentifier,
                  logicalTimestamp: 1_000,
                  type: 'activity'
                },
                {
                  activityInternalId: 'a-00002' as ActivityInternalIdentifier,
                  logicalTimestamp: 3_000,
                  type: 'activity'
                }
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
          livestreamSessionId: 'a-00001' as LivestreamSessionIdentifier,
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
        new Map<ActivityInternalIdentifier, ActivityMapEntry>([
          [
            'a-00001' as ActivityInternalIdentifier,
            {
              activity: activityToExpectation(activity1),
              activityInternalId: 'a-00001' as ActivityInternalIdentifier,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            'a-00003' as ActivityInternalIdentifier,
            {
              activity: activityToExpectation(activity3),
              activityInternalId: 'a-00003' as ActivityInternalIdentifier,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            'a-00002' as ActivityInternalIdentifier,
            {
              activity: activityToExpectation(activity2),
              activityInternalId: 'a-00002' as ActivityInternalIdentifier,
              logicalTimestamp: 3_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added to `livestreamSessions`', (_, state) => {
      expect(state.livestreamingSessionMap).toEqual(
        new Map<LivestreamSessionIdentifier, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionIdentifier,
            {
              activities: [
                {
                  activityInternalId: 'a-00001' as ActivityInternalIdentifier,
                  logicalTimestamp: 1_000,
                  type: 'activity'
                },
                {
                  activityInternalId: 'a-00003' as ActivityInternalIdentifier,
                  logicalTimestamp: 2_000,
                  type: 'activity'
                },
                {
                  activityInternalId: 'a-00002' as ActivityInternalIdentifier,
                  logicalTimestamp: 3_000,
                  type: 'activity'
                }
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
          livestreamSessionId: 'a-00001' as LivestreamSessionIdentifier,
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
        new Map<ActivityInternalIdentifier, ActivityMapEntry>([
          [
            'a-00001' as ActivityInternalIdentifier,
            {
              activity: activityToExpectation(activity1),
              activityInternalId: 'a-00001' as ActivityInternalIdentifier,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            'a-00003' as ActivityInternalIdentifier,
            {
              activity: activityToExpectation(activity3),
              activityInternalId: 'a-00003' as ActivityInternalIdentifier,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            'a-00002' as ActivityInternalIdentifier,
            {
              activity: activityToExpectation(activity2),
              activityInternalId: 'a-00002' as ActivityInternalIdentifier,
              logicalTimestamp: 3_000,
              type: 'activity'
            }
          ],
          [
            'a-00004' as ActivityInternalIdentifier,
            {
              activity: activityToExpectation(activity4),
              activityInternalId: 'a-00004' as ActivityInternalIdentifier,
              logicalTimestamp: 4_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added to `livestreamSessions`', (_, state) => {
      expect(state.livestreamingSessionMap).toEqual(
        new Map<LivestreamSessionIdentifier, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionIdentifier,
            {
              activities: [
                {
                  activityInternalId: 'a-00001' as ActivityInternalIdentifier,
                  logicalTimestamp: 1_000,
                  type: 'activity'
                },
                {
                  activityInternalId: 'a-00003' as ActivityInternalIdentifier,
                  logicalTimestamp: 2_000,
                  type: 'activity'
                },
                {
                  activityInternalId: 'a-00002' as ActivityInternalIdentifier,
                  logicalTimestamp: 3_000,
                  type: 'activity'
                },
                {
                  activityInternalId: 'a-00004' as ActivityInternalIdentifier,
                  logicalTimestamp: 4_000,
                  type: 'activity'
                }
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
          livestreamSessionId: 'a-00001' as LivestreamSessionIdentifier,
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
