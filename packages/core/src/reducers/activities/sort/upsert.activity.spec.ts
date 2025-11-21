/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../../types/WebChatActivity';
import type { LocalId } from './property/LocalId';
import type { Activity, ActivityMapEntry, SortedChatHistory } from './types';
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

scenario('upserting 2 activities with timestamps', bdd => {
  const activity1: Activity = {
    channelData: {
      'webchat:internal:local-id': 'a-00001',
      'webchat:internal:position': 0,
      'webchat:send-status': undefined
    },
    from: { id: 'bot', role: 'bot' },
    id: 'a-00001',
    text: 'Hello, World!',
    timestamp: new Date(1000).toISOString(),
    type: 'message'
  };

  const activity2: Activity = {
    channelData: {
      'webchat:internal:local-id': 'a-00002',
      'webchat:internal:position': 0,
      'webchat:send-status': undefined
    },
    from: { id: 'bot', role: 'bot' },
    id: 'a-00002',
    text: 'Aloha!',
    timestamp: new Date(500).toISOString(),
    type: 'message'
  };

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('upserted', state => upsert({ Date }, state, activity1))
    .then('`activityIdToLocalIdMap` should match', (_, state) => {
      expect(state.activityIdToLocalIdMap).toEqual(new Map([['a-00001', 'a-00001']]));
    })
    .and('should have added activity to `activityMap`', (_, state) => {
      expect(state).toHaveProperty(
        'activityMap',
        new Map(
          Object.entries({
            'a-00001': {
              activity: activityToExpectation(activity1),
              activityLocalId: 'a-00001',
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          })
        )
      );
    })
    .and('should have added activity to `sortedChatHistoryList`', (_, state) => {
      expect(state).toHaveProperty('sortedChatHistoryList', [
        {
          activityLocalId: 'a-00001',
          logicalTimestamp: 1_000,
          type: 'activity'
        }
      ]);
    })
    .and('should match `sortedActivities` snapshot', (_, state) => {
      expect(state).toHaveProperty('sortedActivities', [activityToExpectation(activity1, 1_000)]);
    })
    .when('another activity is upserted', (_, state) => upsert({ Date }, state, activity2))
    .then('`activityIdToLocalIdMap` should match', (_, state) => {
      expect(state.activityIdToLocalIdMap).toEqual(
        new Map([
          ['a-00001', 'a-00001'],
          ['a-00002', 'a-00002']
        ])
      );
    })
    .and('should have added activity to `activityMap`', (_, state) => {
      expect(state).toHaveProperty(
        'activityMap',
        new Map(
          Object.entries({
            'a-00001': {
              activity: {
                channelData: {
                  'webchat:internal:local-id': 'a-00001',
                  'webchat:internal:position': expect.any(Number),
                  'webchat:send-status': undefined
                },
                from: { id: 'bot', role: 'bot' },
                id: 'a-00001',
                text: 'Hello, World!',
                timestamp: new Date(1_000).toISOString(),
                type: 'message'
              },
              activityLocalId: 'a-00001',
              logicalTimestamp: 1_000,
              type: 'activity'
            },
            'a-00002': {
              activity: {
                channelData: {
                  'webchat:internal:local-id': 'a-00002',
                  'webchat:internal:position': expect.any(Number),
                  'webchat:send-status': undefined
                },
                from: { id: 'bot', role: 'bot' },
                id: 'a-00002',
                text: 'Aloha!',
                timestamp: new Date(500).toISOString(),
                type: 'message'
              },
              activityLocalId: 'a-00002',
              logicalTimestamp: 500,
              type: 'activity'
            }
          })
        )
      );
    })
    .and('should have added activity to `sortedChatHistoryList`', (_, state) => {
      expect(state).toHaveProperty('sortedChatHistoryList', [
        {
          activityLocalId: 'a-00002',
          logicalTimestamp: 500,
          type: 'activity'
        },
        {
          activityLocalId: 'a-00001',
          logicalTimestamp: 1_000,
          type: 'activity'
        }
      ]);
    })
    .and('should match `sortedActivities` snapshot', (_, state) => {
      expect(state).toHaveProperty('sortedActivities', [
        activityToExpectation(activity2, 1),
        activityToExpectation(activity1, 1_000)
      ]);
    });
});

scenario('upserting activities which some with timestamp and some without', bdd => {
  const activity1: WebChatActivity = {
    channelData: {
      'webchat:internal:local-id': 'a-00001',
      'webchat:internal:position': 0,
      'webchat:send-status': undefined
    },
    from: { id: 'bot', role: 'bot' },
    id: 'a-00001',
    text: 't=1000ms',
    timestamp: new Date(1_000).toISOString(),
    type: 'message'
  };

  const activity2: WebChatActivity = {
    channelData: {
      'webchat:internal:local-id': 'a-00002',
      'webchat:internal:position': 0,
      'webchat:send-status': undefined
    },
    from: { id: 'bot', role: 'bot' },
    id: 'a-00002',
    text: 't=undefined',
    timestamp: undefined as any,
    type: 'message'
  };

  const activity3: WebChatActivity = {
    channelData: {
      'webchat:internal:local-id': 'a-00003',
      'webchat:internal:position': 0,
      'webchat:send-status': undefined
    },
    from: { id: 'bot', role: 'bot' },
    id: 'a-00003',
    text: 't=2_000ms',
    timestamp: new Date(2_000).toISOString(),
    type: 'message'
  };

  const activity4: WebChatActivity = {
    channelData: {
      'webchat:internal:local-id': 'a-00004',
      'webchat:internal:position': 0,
      'webchat:send-status': undefined
    },
    from: { id: 'bot', role: 'bot' },
    id: 'a-00004',
    text: 't=1500ms',
    timestamp: new Date(1_500).toISOString(),
    type: 'message'
  };

  const activity2b = { ...activity2, timestamp: new Date(1_750).toISOString() };

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('upserting an activity with t=1000ms', state => upsert({ Date }, state, activity1))
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
    .and('should have added to `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          activityLocalId: 'a-00001' as LocalId,
          logicalTimestamp: 1_000,
          type: 'activity'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match', (_, state) => {
      expect(state.sortedActivities).toEqual([activityToExpectation(activity1, 1_000)]);
    })
    .when('upserting an activity with t=undefined', (_, state) => upsert({ Date }, state, activity2))
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
              logicalTimestamp: undefined,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added to `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          activityLocalId: 'a-00001' as LocalId,
          logicalTimestamp: 1_000,
          type: 'activity'
        },
        {
          activityLocalId: 'a-00002' as LocalId,
          logicalTimestamp: undefined,
          type: 'activity'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match', (_, state) => {
      expect(state.sortedActivities).toEqual([
        activityToExpectation(activity1, 1_000),
        activityToExpectation(activity2, 2_000)
      ]);
    })
    .when('upserting an activity with t=2_000ms', (_, state) => upsert({ Date }, state, activity3))
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
              logicalTimestamp: undefined,
              type: 'activity'
            }
          ],
          [
            'a-00003' as LocalId,
            {
              activity: activityToExpectation(activity3),
              activityLocalId: 'a-00003' as LocalId,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added to `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          activityLocalId: 'a-00001' as LocalId,
          logicalTimestamp: 1_000,
          type: 'activity'
        },
        {
          activityLocalId: 'a-00002' as LocalId,
          logicalTimestamp: undefined,
          type: 'activity'
        },
        {
          activityLocalId: 'a-00003' as LocalId,
          logicalTimestamp: 2_000,
          type: 'activity'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match', (_, state) => {
      expect(state.sortedActivities).toEqual([
        activityToExpectation(activity1, 1_000),
        activityToExpectation(activity2, 2_000),
        activityToExpectation(activity3, 3_000)
      ]);
    })
    .when('upserting an activity with t=1500ms', (_, state) => upsert({ Date }, state, activity4))
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
              logicalTimestamp: undefined,
              type: 'activity'
            }
          ],
          [
            'a-00003' as LocalId,
            {
              activity: activityToExpectation(activity3),
              activityLocalId: 'a-00003' as LocalId,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            'a-00004' as LocalId,
            {
              activity: activityToExpectation(activity4),
              activityLocalId: 'a-00004' as LocalId,
              logicalTimestamp: 1_500,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added to `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          activityLocalId: 'a-00001' as LocalId,
          logicalTimestamp: 1_000,
          type: 'activity'
        },
        {
          activityLocalId: 'a-00002' as LocalId,
          logicalTimestamp: undefined,
          type: 'activity'
        },
        {
          activityLocalId: 'a-00004' as LocalId,
          logicalTimestamp: 1_500,
          type: 'activity'
        },
        {
          activityLocalId: 'a-00003' as LocalId,
          logicalTimestamp: 2_000,
          type: 'activity'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match', (_, state) => {
      expect(state.sortedActivities).toEqual([
        activityToExpectation(activity1, 1_000),
        activityToExpectation(activity2, 2_000),
        activityToExpectation(activity4, 2_001),
        activityToExpectation(activity3, 3_000)
      ]);
    })
    .when('upserting the t=undefined activity is updated with t=1750ms', (_, state) =>
      upsert({ Date }, state, activity2b)
    )
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
              activity: activityToExpectation(activity2b),
              activityLocalId: 'a-00002' as LocalId,
              logicalTimestamp: 1_750,
              type: 'activity'
            }
          ],
          [
            'a-00003' as LocalId,
            {
              activity: activityToExpectation(activity3),
              activityLocalId: 'a-00003' as LocalId,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            'a-00004' as LocalId,
            {
              activity: activityToExpectation(activity4),
              activityLocalId: 'a-00004' as LocalId,
              logicalTimestamp: 1_500,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added to `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          activityLocalId: 'a-00001' as LocalId,
          logicalTimestamp: 1_000,
          type: 'activity'
        },
        {
          activityLocalId: 'a-00004' as LocalId,
          logicalTimestamp: 1_500,
          type: 'activity'
        },
        {
          activityLocalId: 'a-00002' as LocalId,
          logicalTimestamp: 1_750, // Update activity is moved here.
          type: 'activity'
        },
        {
          activityLocalId: 'a-00003' as LocalId,
          logicalTimestamp: 2_000,
          type: 'activity'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match', (_, state) => {
      expect(state.sortedActivities).toEqual([
        activityToExpectation(activity1, 1_000),
        activityToExpectation(activity4, 2_001),
        activityToExpectation(activity2b, 2_002),
        activityToExpectation(activity3, 3_000)
      ]);
    });
});
