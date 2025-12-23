/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { parse } from 'valibot';
import type { WebChatActivity } from '../../../types/WebChatActivity';
import deleteActivityByLocalId from './deleteActivityByLocalId';
import { getLocalIdFromActivity, LocalIdSchema, type LocalId } from './property/LocalId';
import { LivestreamSessionId, type LivestreamSessionMapEntry } from './types';
import upsert, { INITIAL_STATE } from './upsert';

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
      'webchat:internal:local-id': parse(LocalIdSchema, `_:${id}`),
      'webchat:internal:position': 0,
      'webchat:send-status': undefined,
      ...activity.channelData
    }
  } as any;
}

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
      deleteActivityByLocalId(state, getLocalIdFromActivity(state.sortedActivities[2]))
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
        new Map<LivestreamSessionId, LivestreamSessionMapEntry>([
          [
            'a-00001' as LivestreamSessionId,
            {
              activities: [
                {
                  activityLocalId: '_:a-00001' as LocalId,
                  logicalTimestamp: 1_000,
                  sequenceNumber: 1,
                  type: 'activity'
                },
                {
                  activityLocalId: '_:a-00002' as LocalId,
                  logicalTimestamp: 2_000,
                  sequenceNumber: 2,
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
    .when('all activities are delete', (_, state) =>
      deleteActivityByLocalId(
        deleteActivityByLocalId(state, getLocalIdFromActivity(state.sortedActivities[1])),
        getLocalIdFromActivity(state.sortedActivities[0])
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
