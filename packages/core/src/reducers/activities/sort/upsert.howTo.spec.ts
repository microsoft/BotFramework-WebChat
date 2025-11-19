/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../types/WebChatActivity';
import type {
  Activity,
  ActivityInternalIdentifier,
  ActivityMapEntry,
  HowToGroupingIdentifier,
  HowToGroupingMapEntry,
  SortedChatHistory
} from './types';
import upsert, { INITIAL_STATE } from './upsert';

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
  activity: { id: string; text: string; timestamp: string },
  messageEntity: { isPartOf: SingularOrPlural<{ '@id': string; '@type': string }>; position: number } | undefined
): WebChatActivity {
  const { id } = activity;

  return {
    channelData: { 'webchat:internal:id': id, 'webchat:internal:position': 0, 'webchat:send-status': undefined },
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
    type: 'message',
    ...activity
  };
}

scenario('upserting plain activity in the same grouping', bdd => {
  const activity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World!', timestamp: new Date(1_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  const activity2 = buildActivity(
    { id: 'a-00002', text: 'Aloha!', timestamp: new Date(2_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 3 }
  );

  const activity3 = buildActivity(
    { id: 'a-00003', text: 'Aloha!', timestamp: new Date(3_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
  );

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('upserted', state => upsert({ Date }, state, activity1))
    .then('should have added to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<string, ActivityMapEntry>([
          [
            'a-00001',
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
    .and('should have added a new part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<string, HowToGroupingMapEntry>([
          [
            '_:how-to:00001',
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  activityInternalId: 'a-00001' as ActivityInternalIdentifier,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'activity'
                }
              ]
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
      expect(state).toHaveProperty('sortedActivities', [activityToExpectation(activity1)]);
    })
    .when('upsert another activity into same group', (_, state) => upsert({ Date }, state, activity2))
    .then('should add to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<string, ActivityMapEntry>([
          [
            'a-00001',
            {
              activity: activityToExpectation(activity1),
              activityInternalId: 'a-00001' as ActivityInternalIdentifier,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            'a-00002',
            {
              activity: activityToExpectation(activity2),
              activityInternalId: 'a-00002' as ActivityInternalIdentifier,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should update existing part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<string, HowToGroupingMapEntry>([
          [
            '_:how-to:00001',
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  activityInternalId: 'a-00001' as ActivityInternalIdentifier,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'activity'
                },
                {
                  activityInternalId: 'a-00002' as ActivityInternalIdentifier,
                  logicalTimestamp: 2_000,
                  position: 3,
                  type: 'activity'
                }
              ]
            }
          ]
        ])
      );
    })
    .and('should appear in `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingIdentifier,
          logicalTimestamp: 1_000, // Should not update to 2_000.
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state).toHaveProperty('sortedActivities', [
        activityToExpectation(activity1),
        activityToExpectation(activity2)
      ]);
    })
    .when('the third activity is upserted', (_, state) => upsert({ Date }, state, activity3))
    .then('should add to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<string, ActivityMapEntry>([
          [
            'a-00001',
            {
              activity: activityToExpectation(activity1),
              activityInternalId: 'a-00001' as ActivityInternalIdentifier,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            'a-00002',
            {
              activity: activityToExpectation(activity2),
              activityInternalId: 'a-00002' as ActivityInternalIdentifier,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            'a-00003',
            {
              activity: activityToExpectation(activity3),
              activityInternalId: 'a-00003' as ActivityInternalIdentifier,
              logicalTimestamp: 3_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should update existing part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<string, HowToGroupingMapEntry>([
          [
            '_:how-to:00001',
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  activityInternalId: 'a-00001' as ActivityInternalIdentifier,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'activity'
                },
                {
                  activityInternalId: 'a-00003' as ActivityInternalIdentifier,
                  logicalTimestamp: 3_000,
                  position: 2,
                  type: 'activity'
                },
                {
                  activityInternalId: 'a-00002' as ActivityInternalIdentifier,
                  logicalTimestamp: 2_000,
                  position: 3,
                  type: 'activity'
                }
              ]
            }
          ]
        ])
      );
    })
    .and('should appear in `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingIdentifier,
          logicalTimestamp: 1_000, // Should not update to 2_000.
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state).toHaveProperty('sortedActivities', [
        activityToExpectation(activity1),
        activityToExpectation(activity3),
        activityToExpectation(activity2)
      ]);
    });
});

scenario('upserting plain activity in two different grouping', bdd => {
  const activity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World!', timestamp: new Date(1000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  const activity2 = buildActivity(
    { id: 'a-00002', text: 'Aloha!', timestamp: new Date(500).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00002', '@type': 'HowTo' }], position: 1 }
  );

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('upserted', state => upsert({ Date }, state, activity1))
    .then('should have added a new part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<string, HowToGroupingMapEntry>([
          [
            '_:how-to:00001',
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  activityInternalId: 'a-00001' as ActivityInternalIdentifier,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'activity'
                }
              ]
            }
          ]
        ])
      );
    })
    .and('should have inserted into `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        { logicalTimestamp: 1_000, howToGroupingId: '_:how-to:00001', type: 'how to grouping' }
      ]);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([activityToExpectation(activity1, 1_000)]);
    })
    .when('upsert another activity into same group with a former timestamp', (_, state) =>
      upsert({ Date }, state, activity2)
    )
    .then('should update existing part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<string, HowToGroupingMapEntry>([
          [
            '_:how-to:00001',
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  activityInternalId: 'a-00001' as ActivityInternalIdentifier,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'activity'
                }
              ]
            }
          ],
          [
            '_:how-to:00002',
            {
              logicalTimestamp: 500,
              partList: [
                {
                  activityInternalId: 'a-00002' as ActivityInternalIdentifier,
                  logicalTimestamp: 500,
                  position: 1,
                  type: 'activity'
                }
              ]
            }
          ]
        ])
      );
    })
    .and('should appear in `sortedChatHistoryList` as a separate entry', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00002' as HowToGroupingIdentifier,
          logicalTimestamp: 500,
          type: 'how to grouping'
        },
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingIdentifier,
          logicalTimestamp: 1_000,
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([
        activityToExpectation(activity2, 1),
        activityToExpectation(activity1, 1_000)
      ]);
    });
});
