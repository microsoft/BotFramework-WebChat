/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../../types/WebChatActivity';
import deleteActivityByLocalId from './deleteActivityByLocalId';
import getActivityLocalId from './private/getActivityLocalId';
import type {
  ActivityLocalId,
  HowToGroupingMapEntry,
  HowToGroupingMapPartEntry,
  LivestreamSessionId,
  LivestreamSessionMapEntry,
  LivestreamSessionMapEntryActivityEntry
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
      'webchat:internal:local-id': id,
      'webchat:internal:position': 0,
      'webchat:send-status': undefined,
      ...activity.channelData
    }
  } as any;
}

scenario('delete livestream activities in part grouping', bdd => {
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

  const activity4 = buildActivity(
    {
      channelData: undefined,
      id: 'a-00004',
      text: 'Hello, World!',
      timestamp: new Date(4_000).toISOString(),
      type: 'message'
    },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
  );

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('4 activities are upserted', state =>
      upsert(
        { Date },
        upsert({ Date }, upsert({ Date }, upsert({ Date }, state, activity1), activity2), activity3),
        activity4
      )
    )
    .then('should have 4 activities', (_, state) => {
      expect(state.activityMap).toHaveProperty('size', 4);
      expect(state.howToGroupingMap).toHaveProperty('size', 1);
      expect(state.livestreamSessionMap).toHaveProperty('size', 1);
      expect(state.sortedActivities).toHaveLength(4);
      expect(state.sortedChatHistoryList).toHaveLength(1);
    })
    .when('the last livestream activity is delete', (_, state) =>
      deleteActivityByLocalId(state, getActivityLocalId(state.sortedActivities[2]))
    )
    .then('should have 3 activities', (_, state) => {
      expect(state.activityMap).toHaveProperty('size', 3);
      expect(state.howToGroupingMap).toHaveProperty('size', 1);
      expect(state.livestreamSessionMap).toHaveProperty('size', 1);
      expect(state.sortedActivities).toHaveLength(3);
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
    .and('`howToGroupingMap` should match', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map([
          [
            '_:how-to:00001',
            {
              logicalTimestamp: 4_000,
              partList: [
                {
                  livestreamSessionId: 'a-00001' as LivestreamSessionId,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'livestream session'
                } satisfies HowToGroupingMapPartEntry,
                {
                  activityLocalId: 'a-00004' as ActivityLocalId,
                  logicalTimestamp: 4_000,
                  position: 2,
                  type: 'activity'
                } satisfies HowToGroupingMapPartEntry
              ]
            } satisfies HowToGroupingMapEntry
          ]
        ])
      );
    })
    .when('all livestream activities are delete', (_, state) =>
      deleteActivityByLocalId(
        deleteActivityByLocalId(state, getActivityLocalId(state.sortedActivities[1])),
        getActivityLocalId(state.sortedActivities[0])
      )
    )
    .then('should have 1 activity', (_, state) => {
      expect(state.activityMap).toHaveProperty('size', 1);
      expect(state.howToGroupingMap).toHaveProperty('size', 1);
      expect(state.livestreamSessionMap).toHaveProperty('size', 0);
      expect(state.sortedActivities).toHaveLength(1);
      expect(state.sortedChatHistoryList).toHaveLength(1);
    })
    .and('`howToGroupingMap` should match', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map([
          [
            '_:how-to:00001',
            {
              logicalTimestamp: 4_000,
              partList: [
                {
                  activityLocalId: 'a-00004' as ActivityLocalId,
                  logicalTimestamp: 4_000,
                  position: 2,
                  type: 'activity'
                } satisfies HowToGroupingMapPartEntry
              ]
            } satisfies HowToGroupingMapEntry
          ]
        ])
      );
    })
    .when('all activities are delete', (_, state) =>
      deleteActivityByLocalId(state, getActivityLocalId(state.sortedActivities[0]))
    )
    .then('should have no activities', (_, state) => {
      expect(state.activityMap).toHaveProperty('size', 0);
      expect(state.howToGroupingMap).toHaveProperty('size', 0);
      expect(state.livestreamSessionMap).toHaveProperty('size', 0);
      expect(state.sortedActivities).toHaveLength(0);
      expect(state.sortedChatHistoryList).toHaveLength(0);
    });
});
