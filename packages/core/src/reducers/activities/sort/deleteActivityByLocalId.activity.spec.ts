/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import deleteActivityByLocalId from './deleteActivityByLocalId';
import { getLocalIdFromActivity, type LocalId } from './property/LocalId';
import { type Activity, type ActivityMapEntry, type SortedChatHistoryEntry } from './types';
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

scenario('deleting activity', bdd => {
  const activity1: Activity = {
    channelData: {
      'webchat:internal:local-id': '_:a-00001' as LocalId,
      'webchat:internal:position': 0,
      'webchat:send-status': undefined
    },
    from: { id: 'bot', role: 'bot' },
    id: 'a-00001',
    text: 'Hello, World!',
    timestamp: new Date(1_000).toISOString(),
    type: 'message'
  };

  const activity2: Activity = {
    channelData: {
      'webchat:internal:local-id': '_:a-00002' as LocalId,
      'webchat:internal:position': 0,
      'webchat:send-status': undefined
    },
    from: { id: 'bot', role: 'bot' },
    id: 'a-00002',
    text: 'Aloha!',
    timestamp: new Date(2_000).toISOString(),
    type: 'message'
  };

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('2 activities are upserted', state => upsert({ Date }, upsert({ Date }, state, activity1), activity2))
    .then('should have 2 activities', (_, state) => {
      expect(state.activityIdToLocalIdMap).toHaveProperty('size', 2);
      expect(state.activityMap).toHaveProperty('size', 2);
      expect(state.howToGroupingMap).toHaveProperty('size', 0);
      expect(state.livestreamSessionMap).toHaveProperty('size', 0);
      expect(state.sortedActivities).toHaveLength(2);
      expect(state.sortedChatHistoryList).toHaveLength(2);
    })
    .when('the first activity is deleted', (_, state) =>
      deleteActivityByLocalId(state, getLocalIdFromActivity(state.sortedActivities[0]!))
    )
    .then('should have 1 activity', (_, state) => {
      expect(state.activityIdToLocalIdMap).toHaveProperty('size', 1);
      expect(state.activityMap).toHaveProperty('size', 1);
      expect(state.howToGroupingMap).toHaveProperty('size', 0);
      expect(state.livestreamSessionMap).toHaveProperty('size', 0);
      expect(state.sortedActivities).toHaveLength(1);
      expect(state.sortedChatHistoryList).toHaveLength(1);
    })
    .and('`activityIdToLocalIdMap` should match', (_, state) => {
      expect(state.activityIdToLocalIdMap).toEqual(new Map<string, LocalId>([['a-00002', '_:a-00002' as LocalId]]));
    })
    .and('`activityMap` should match', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<LocalId, ActivityMapEntry>([
          [
            '_:a-00002' as LocalId,
            {
              activity: activityToExpectation(activity2, 2_000),
              activityLocalId: '_:a-00002' as LocalId,
              logicalTimestamp: 2_000,
              type: 'activity'
            } satisfies ActivityMapEntry
          ]
        ])
      );
    })
    .and('`sortedActivities` should match', (_, state) => {
      expect(state.sortedActivities).toEqual([activityToExpectation(activity2, 2_000)]);
    })
    .and('`sortedChatHistoryList` should match', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          activityLocalId: '_:a-00002' as LocalId,
          logicalTimestamp: 2_000,
          type: 'activity'
        } satisfies SortedChatHistoryEntry
      ]);
    });
});

scenario('deleting an outgoing activity', bdd => {
  const activity1: Activity = {
    channelData: {
      clientActivityID: 'caid-00001',
      'webchat:internal:local-id': '_:a-00001' as LocalId,
      'webchat:internal:position': 0,
      'webchat:send-status': 'sending'
    } as any,
    from: { id: 'user', role: 'user' },
    id: 'a-00001',
    text: 'Hello, World!',
    timestamp: new Date(1_000).toISOString(),
    type: 'message'
  };

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('1 activity are upserted', state => upsert({ Date }, state, activity1))
    .then('should have 1 activity', (_, state) => {
      expect(state.activityIdToLocalIdMap).toHaveProperty('size', 1);
      expect(state.activityMap).toHaveProperty('size', 1);
      expect(state.clientActivityIdToLocalIdMap).toHaveProperty('size', 1);
      expect(state.howToGroupingMap).toHaveProperty('size', 0);
      expect(state.livestreamSessionMap).toHaveProperty('size', 0);
      expect(state.sortedActivities).toHaveLength(1);
      expect(state.sortedChatHistoryList).toHaveLength(1);
    })
    .and('`clientActivityIdToLocalMap` should match', (_, state) => {
      expect(state.clientActivityIdToLocalIdMap).toEqual(
        new Map<string, LocalId>([['caid-00001', '_:a-00001' as LocalId]])
      );
    })
    .when('the first activity is deleted', (_, state) =>
      deleteActivityByLocalId(state, getLocalIdFromActivity(state.sortedActivities[0]!))
    )
    .then('should have no activities', (_, state) => {
      expect(state.activityIdToLocalIdMap).toHaveProperty('size', 0);
      expect(state.activityMap).toHaveProperty('size', 0);
      expect(state.clientActivityIdToLocalIdMap).toHaveProperty('size', 0);
      expect(state.howToGroupingMap).toHaveProperty('size', 0);
      expect(state.livestreamSessionMap).toHaveProperty('size', 0);
      expect(state.sortedActivities).toHaveLength(0);
      expect(state.sortedChatHistoryList).toHaveLength(0);
    });
});
