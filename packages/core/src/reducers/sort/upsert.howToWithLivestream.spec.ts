/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../types/WebChatActivity';
import type {
  ActivityInternalIdentifier,
  ActivityMapEntry,
  HowToGroupingIdentifier,
  HowToGroupingMapEntry,
  LivestreamSessionIdentifier,
  LivestreamSessionMapEntry,
  SortedChatHistory
} from './types';
import upsert, { INITIAL_STATE } from './upsert';

type SingularOrPlural<T> = T | readonly T[];

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
      },
  messageEntity: { isPartOf: SingularOrPlural<{ '@id': string; '@type': string }>; position: number } | undefined
): WebChatActivity {
  const { id } = activity;

  return {
    ...(messageEntity
      ? {
          entities: [
            {
              '@context': 'https://schema.org',
              '@id': '',
              '@type': 'Message',
              type: 'https://schema.org/Message',
              ...messageEntity
            } as any
          ]
        }
      : {}),
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

scenario('upserting plain activity in the same grouping', bdd => {
  const activity1 = buildActivity(
    {
      channelData: { streamSequence: 1, streamType: 'streaming' },
      id: 'a-00001',
      text: 'A quick',
      timestamp: new Date(1_000).toISOString(),
      type: 'typing'
    },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  const activity2 = buildActivity(
    {
      channelData: { streamId: 'a-00001', streamSequence: 2, streamType: 'streaming' },
      id: 'a-00002',
      text: 'A quick brown fox',
      timestamp: new Date(2_000).toISOString(),
      type: 'typing'
    },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  const activity3 = buildActivity(
    {
      channelData: { streamId: 'a-00001', streamType: 'final' },
      id: 'a-00003',
      text: 'A quick brown fox jumped over the lazy dogs.',
      timestamp: new Date(3_000).toISOString(),
      type: 'message'
    },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('the first activity is upserted', state => upsert({ Date }, state, activity1))
    .then('should have added to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<string, ActivityMapEntry>([
          [
            'a-00001',
            {
              activity: activity1,
              activityInternalId: 'a-00001' as ActivityInternalIdentifier,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added a new part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<string, HowToGroupingMapEntry>([
          [
            '_:how-to:00001',
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  livestreamSessionId: 'a-00001' as LivestreamSessionIdentifier,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'livestream session'
                }
              ]
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
    .and('should appear in `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingIdentifier,
          logicalTimestamp: 1_000,
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([activity1]);
    })
    .when('the second activity is upserted', (_, state) => upsert({ Date }, state, activity2))
    .then('should have added to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<string, ActivityMapEntry>([
          [
            'a-00001',
            {
              activity: activity1,
              activityInternalId: 'a-00001' as ActivityInternalIdentifier,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            'a-00002',
            {
              activity: activity2,
              activityInternalId: 'a-00002' as ActivityInternalIdentifier,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should not modify new part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<string, HowToGroupingMapEntry>([
          [
            '_:how-to:00001',
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  livestreamSessionId: 'a-00001' as LivestreamSessionIdentifier,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'livestream session'
                }
              ]
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
                  logicalTimestamp: 2_000,
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
          howToGroupingId: '_:how-to:00001' as HowToGroupingIdentifier,
          logicalTimestamp: 1_000,
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([activity1, activity2]);
    })
    .when('the third activity is upserted', (_, state) => upsert({ Date }, state, activity3))
    .then('should have added to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<string, ActivityMapEntry>([
          [
            'a-00001',
            {
              activity: activity1,
              activityInternalId: 'a-00001' as ActivityInternalIdentifier,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            'a-00002',
            {
              activity: activity2,
              activityInternalId: 'a-00002' as ActivityInternalIdentifier,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            'a-00003',
            {
              activity: activity3,
              activityInternalId: 'a-00003' as ActivityInternalIdentifier,
              logicalTimestamp: 3_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should not modify new part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<string, HowToGroupingMapEntry>([
          [
            '_:how-to:00001',
            {
              logicalTimestamp: 1_000, // Should kept as 1_000, once HowTo is constructed, the timestamp never change.
              partList: [
                {
                  livestreamSessionId: 'a-00001' as LivestreamSessionIdentifier,
                  logicalTimestamp: 3_000, // Livestream updated to 3_000.
                  position: 1,
                  type: 'livestream session'
                }
              ]
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
                  logicalTimestamp: 2_000,
                  type: 'activity'
                },
                {
                  activityInternalId: 'a-00003' as ActivityInternalIdentifier,
                  logicalTimestamp: 3_000,
                  type: 'activity'
                }
              ],
              finalized: true,
              logicalTimestamp: 3_000
            }
          ]
        ])
      );
    })
    .and('should not modify `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingIdentifier,
          logicalTimestamp: 1_000,
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([activity1, activity2, activity3]);
    });
});
