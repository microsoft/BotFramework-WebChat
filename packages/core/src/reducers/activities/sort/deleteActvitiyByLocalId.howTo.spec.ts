/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../../types/WebChatActivity';
import deleteActivityByLocalId from './deleteActivityByLocalId';
import { getLocalIdFromActivity, LocalIdSchema, type LocalId } from './property/LocalId';
import type {
  Activity,
  ActivityMapEntry,
  HowToGroupingId,
  HowToGroupingMapEntry,
  HowToGroupingMapPartEntry,
  SortedChatHistoryEntry
} from './types';
import upsert, { INITIAL_STATE } from './upsert';
import { parse } from 'valibot';

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
    channelData: {
      'webchat:internal:local-id': parse(LocalIdSchema, `_:${id}`),
      'webchat:internal:position': 0,
      'webchat:send-status': undefined
    },
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

scenario('deleting an activity in the same grouping', bdd => {
  const activity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World!', timestamp: new Date(1_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  const activity2 = buildActivity(
    { id: 'a-00002', text: 'Aloha!', timestamp: new Date(2_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
  );

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('2 activities are upserted', state => upsert({ Date }, upsert({ Date }, state, activity1), activity2))
    .then('should have 2 activities', (_, state) => {
      expect(state.activityMap).toHaveProperty('size', 2);
      expect(state.howToGroupingMap).toHaveProperty('size', 1);
      expect(state.livestreamSessionMap).toHaveProperty('size', 0);
      expect(state.sortedActivities).toHaveLength(2);
      expect(state.sortedChatHistoryList).toHaveLength(1);
    })
    .when('the second activity is deleted', (_, state) =>
      deleteActivityByLocalId(state, getLocalIdFromActivity(state.sortedActivities[1]))
    )
    .then('should have 1 activity', (_, state) => {
      expect(state.activityMap).toHaveProperty('size', 1);
      expect(state.howToGroupingMap).toHaveProperty('size', 1);
      expect(state.livestreamSessionMap).toHaveProperty('size', 0);
      expect(state.sortedActivities).toHaveLength(1);
      expect(state.sortedChatHistoryList).toHaveLength(1);
    })
    .and('`activityMap` should match', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<LocalId, ActivityMapEntry>([
          [
            '_:a-00001' as LocalId,
            {
              activity: activityToExpectation(activity1, 1_000),
              activityLocalId: '_:a-00001' as LocalId,
              logicalTimestamp: 1_000,
              type: 'activity'
            } satisfies ActivityMapEntry
          ]
        ])
      );
    })
    .and('`howToGroupingMap` should match', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map([
          [
            '_:how-to:00001',
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  activityLocalId: '_:a-00001' as LocalId,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'activity'
                } satisfies HowToGroupingMapPartEntry
              ]
            } satisfies HowToGroupingMapEntry
          ]
        ])
      );
    })
    .and('`sortedActivities` should match', (_, state) => {
      expect(state.sortedActivities).toEqual([activityToExpectation(activity1, 1_000)]);
    })
    .and('`sortedChatHistoryList` should match', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingId,
          logicalTimestamp: 1_000,
          type: 'how to grouping'
        } satisfies SortedChatHistoryEntry
      ]);
    })
    .when('the first activity is deleted', (_, state) =>
      deleteActivityByLocalId(state, getLocalIdFromActivity(state.sortedActivities[0]))
    )
    .then('should have no activities', (_, state) => {
      expect(state.activityMap).toHaveProperty('size', 0);
      expect(state.howToGroupingMap).toHaveProperty('size', 0);
      expect(state.livestreamSessionMap).toHaveProperty('size', 0);
      expect(state.sortedActivities).toHaveLength(0);
      expect(state.sortedChatHistoryList).toHaveLength(0);
    });
});
