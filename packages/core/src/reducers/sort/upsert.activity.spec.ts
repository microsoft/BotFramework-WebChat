/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import upsert, { INITIAL_STATE } from './upsert';
import type { WebChatActivity } from '../../types/WebChatActivity';
import type { Activity, ActivityInternalIdentifier, ActivityMapEntry, SortedChatHistory } from './types';

scenario('upserting 2 activities with timestamps', bdd => {
  const activity1: Activity = {
    channelData: {
      'webchat:internal:id': 'a-00001',
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
      'webchat:internal:id': 'a-00002',
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
    .then('should have added activity to `activityMap`', (_, state) => {
      expect(state).toHaveProperty(
        'activityMap',
        new Map(
          Object.entries({
            'a-00001': {
              activity: activity1,
              activityInternalId: 'a-00001',
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
          activityInternalId: 'a-00001',
          logicalTimestamp: 1_000,
          type: 'activity'
        }
      ]);
    })
    .and('should match `sortedActivities` snapshot', (_, state) => {
      expect(state).toHaveProperty('sortedActivities', [activity1]);
    })
    .when('another activity is upserted', (_, state) => upsert({ Date }, state, activity2))
    .then('should have added activity to `activityMap`', (_, state) => {
      expect(state).toHaveProperty(
        'activityMap',
        new Map(
          Object.entries({
            'a-00001': {
              activity: {
                channelData: {
                  'webchat:internal:id': 'a-00001',
                  'webchat:internal:position': 0,
                  'webchat:send-status': undefined
                },
                from: { id: 'bot', role: 'bot' },
                id: 'a-00001',
                text: 'Hello, World!',
                timestamp: new Date(1_000).toISOString(),
                type: 'message'
              },
              activityInternalId: 'a-00001',
              logicalTimestamp: 1_000,
              type: 'activity'
            },
            'a-00002': {
              activity: {
                channelData: {
                  'webchat:internal:id': 'a-00002',
                  'webchat:internal:position': 0,
                  'webchat:send-status': undefined
                },
                from: { id: 'bot', role: 'bot' },
                id: 'a-00002',
                text: 'Aloha!',
                timestamp: new Date(500).toISOString(),
                type: 'message'
              },
              activityInternalId: 'a-00002',
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
          activityInternalId: 'a-00002',
          logicalTimestamp: 500,
          type: 'activity'
        },
        {
          activityInternalId: 'a-00001',
          logicalTimestamp: 1_000,
          type: 'activity'
        }
      ]);
    })
    .and('should match `sortedActivities` snapshot', (_, state) => {
      expect(state).toHaveProperty('sortedActivities', [activity2, activity1]);
    });
});

scenario('upserting activities which some with timestamp and some without', bdd => {
  const activity1: WebChatActivity = {
    channelData: {
      'webchat:internal:id': 'a-00001',
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
      'webchat:internal:id': 'a-00002',
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
      'webchat:internal:id': 'a-00003',
      'webchat:internal:position': 0,
      'webchat:send-status': undefined
    },
    from: { id: 'bot', role: 'bot' },
    id: 'a-00003',
    text: 't=2000ms',
    timestamp: new Date(2_000).toISOString(),
    type: 'message'
  };

  const activity4: WebChatActivity = {
    channelData: {
      'webchat:internal:id': 'a-00004',
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
    .and('should have added to `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          activityInternalId: 'a-00001' as ActivityInternalIdentifier,
          logicalTimestamp: 1_000,
          type: 'activity'
        }
      ] satisfies SortedChatHistory);
    })
    .when('upserting an activity with t=undefined', (_, state) => upsert({ Date }, state, activity2))
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
          activityInternalId: 'a-00001' as ActivityInternalIdentifier,
          logicalTimestamp: 1_000,
          type: 'activity'
        },
        {
          activityInternalId: 'a-00002' as ActivityInternalIdentifier,
          logicalTimestamp: undefined,
          type: 'activity'
        }
      ] satisfies SortedChatHistory);
    })
    .when('upserting an activity with t=2000ms', (_, state) => upsert({ Date }, state, activity3))
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
              logicalTimestamp: undefined,
              type: 'activity'
            }
          ],
          [
            'a-00003',
            {
              activity: activity3,
              activityInternalId: 'a-00003' as ActivityInternalIdentifier,
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
          activityInternalId: 'a-00001' as ActivityInternalIdentifier,
          logicalTimestamp: 1_000,
          type: 'activity'
        },
        {
          activityInternalId: 'a-00002' as ActivityInternalIdentifier,
          logicalTimestamp: undefined,
          type: 'activity'
        },
        {
          activityInternalId: 'a-00003' as ActivityInternalIdentifier,
          logicalTimestamp: 2_000,
          type: 'activity'
        }
      ] satisfies SortedChatHistory);
    })
    .when('upserting an activity with t=1500ms', (_, state) => upsert({ Date }, state, activity4))
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
              logicalTimestamp: undefined,
              type: 'activity'
            }
          ],
          [
            'a-00003',
            {
              activity: activity3,
              activityInternalId: 'a-00003' as ActivityInternalIdentifier,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            'a-00004',
            {
              activity: activity4,
              activityInternalId: 'a-00004' as ActivityInternalIdentifier,
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
          activityInternalId: 'a-00001' as ActivityInternalIdentifier,
          logicalTimestamp: 1_000,
          type: 'activity'
        },
        {
          activityInternalId: 'a-00002' as ActivityInternalIdentifier,
          logicalTimestamp: undefined,
          type: 'activity'
        },
        {
          activityInternalId: 'a-00004' as ActivityInternalIdentifier,
          logicalTimestamp: 1_500,
          type: 'activity'
        },
        {
          activityInternalId: 'a-00003' as ActivityInternalIdentifier,
          logicalTimestamp: 2_000,
          type: 'activity'
        }
      ] satisfies SortedChatHistory);
    })
    .when('upserting the t=undefined activity is updated with t=1750ms', (_, state) =>
      upsert({ Date }, state, activity2b)
    )
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
              activity: activity2b,
              activityInternalId: 'a-00002' as ActivityInternalIdentifier,
              logicalTimestamp: 1_750,
              type: 'activity'
            }
          ],
          [
            'a-00003',
            {
              activity: activity3,
              activityInternalId: 'a-00003' as ActivityInternalIdentifier,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            'a-00004',
            {
              activity: activity4,
              activityInternalId: 'a-00004' as ActivityInternalIdentifier,
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
          activityInternalId: 'a-00001' as ActivityInternalIdentifier,
          logicalTimestamp: 1_000,
          type: 'activity'
        },
        {
          activityInternalId: 'a-00004' as ActivityInternalIdentifier,
          logicalTimestamp: 1_500,
          type: 'activity'
        },
        {
          activityInternalId: 'a-00002' as ActivityInternalIdentifier,
          logicalTimestamp: 1_750, // Update activity is moved here.
          type: 'activity'
        },
        {
          activityInternalId: 'a-00003' as ActivityInternalIdentifier,
          logicalTimestamp: 2_000,
          type: 'activity'
        }
      ] satisfies SortedChatHistory);
    });
});
