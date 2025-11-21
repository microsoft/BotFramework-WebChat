/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../../types/WebChatActivity';
import type {
  Activity,
  ActivityMapEntry,
  HowToGroupingId,
  HowToGroupingMapEntry,
  LivestreamSessionId,
  LivestreamSessionMapEntry,
  LivestreamSessionMapEntryActivityEntry,
  SortedChatHistory
} from './types';
import upsert, { INITIAL_STATE } from './upsert';
import type { LocalId } from './property/LocalId';

type SingularOrPlural<T> = T | readonly T[];

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
      'webchat:internal:local-id': id,
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
        new Map<LocalId, ActivityMapEntry>([
          [
            'a-00001' as LocalId,
            {
              activity: activityToExpectation(activity1),
              activityLocalId: 'a-00001' as LocalId,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added a new part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00001' as HowToGroupingId,
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  livestreamSessionId: 'a-00001' as LivestreamSessionId,
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
      expect(state.livestreamSessionMap).toEqual(
        new Map<LivestreamSessionId, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionId,
            {
              activities: [
                {
                  activityLocalId: 'a-00001' as LocalId,
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
    .and('should appear in `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingId,
          logicalTimestamp: 1_000,
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([activityToExpectation(activity1, 1_000)]);
    })
    .when('the second activity is upserted', (_, state) => upsert({ Date }, state, activity2))
    .then('should have added to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<LocalId, ActivityMapEntry>([
          [
            'a-00001' as LocalId,
            {
              activity: activityToExpectation(activity1),
              activityLocalId: 'a-00001' as LocalId,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            'a-00002' as LocalId,
            {
              activity: activityToExpectation(activity2),
              activityLocalId: 'a-00002' as LocalId,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should not modify new part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00001' as HowToGroupingId,
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  livestreamSessionId: 'a-00001' as LivestreamSessionId,
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
      expect(state.livestreamSessionMap).toEqual(
        new Map<LivestreamSessionId, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionId,
            {
              activities: [
                {
                  activityLocalId: 'a-00001' as LocalId,
                  logicalTimestamp: 1_000,
                  sequenceNumber: 1,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry,
                {
                  activityLocalId: 'a-00002' as LocalId,
                  logicalTimestamp: 2_000,
                  sequenceNumber: 2,
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
          howToGroupingId: '_:how-to:00001' as HowToGroupingId,
          logicalTimestamp: 1_000,
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
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
        new Map<LocalId, ActivityMapEntry>([
          [
            'a-00001' as LocalId,
            {
              activity: activityToExpectation(activity1),
              activityLocalId: 'a-00001' as LocalId,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            'a-00002' as LocalId,
            {
              activity: activityToExpectation(activity2),
              activityLocalId: 'a-00002' as LocalId,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            'a-00003' as LocalId,
            {
              activity: activityToExpectation(activity3),
              activityLocalId: 'a-00003' as LocalId,
              logicalTimestamp: 3_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should not modify new part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00001' as HowToGroupingId,
            {
              logicalTimestamp: 3_000, // Should follow livestream session and update to 3_000.
              partList: [
                {
                  livestreamSessionId: 'a-00001' as LivestreamSessionId,
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
      expect(state.livestreamSessionMap).toEqual(
        new Map<LivestreamSessionId, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionId,
            {
              activities: [
                {
                  activityLocalId: 'a-00001' as LocalId,
                  logicalTimestamp: 1_000,
                  sequenceNumber: 1,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry,
                {
                  activityLocalId: 'a-00002' as LocalId,
                  logicalTimestamp: 2_000,
                  sequenceNumber: 2,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry,
                {
                  activityLocalId: 'a-00003' as LocalId,
                  logicalTimestamp: 3_000,
                  sequenceNumber: Infinity,
                  type: 'activity'
                } satisfies LivestreamSessionMapEntryActivityEntry
              ],
              finalized: true,
              logicalTimestamp: 3_000
            }
          ]
        ])
      );
    })
    .and('`sortedChatHistoryList` should match', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingId,
          logicalTimestamp: 3_000, // Update to 3_000 on finalize.
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match', (_, state) => {
      expect(state.sortedActivities).toEqual([
        activityToExpectation(activity1, 1_000),
        activityToExpectation(activity2, 2_000),
        activityToExpectation(activity3, 3_000)
      ]);
    });
});
