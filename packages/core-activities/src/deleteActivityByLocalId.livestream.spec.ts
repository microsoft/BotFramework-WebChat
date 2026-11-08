/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { parse } from 'valibot';
import type { WebChatActivity } from './types/WebChatActivity';
import deleteActivityByLocalId from './deleteActivityByLocalId';
import { getLocalIdFromActivity, LocalIdSchema, type LocalId } from './property/LocalId';
import { LivestreamSessionId, type LivestreamSessionMapEntry, type State } from './types';
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
    .then('should have 3 activities in map, 1 visible', (_, state) => {
      expect(state.activityMap).toHaveProperty('size', 3);
      expect(state.howToGroupingMap).toHaveProperty('size', 0);
      expect(state.livestreamSessionMap).toHaveProperty('size', 1);
      expect(state.sortedActivities).toHaveLength(1);
      expect(state.sortedChatHistoryList).toHaveLength(1);
    })
    .when('the last activity is delete', (_, state) =>
      deleteActivityByLocalId(state, getLocalIdFromActivity(state.sortedActivities[0]))
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

// Session `s`: the first revision's ID is the session ID. Without a sequence number, the revision is the final one.
function revision(id: string, sequence: number | undefined, timestamp: number, extra: object = {}): WebChatActivity {
  return {
    ...buildActivity(
      typeof sequence === 'undefined'
        ? {
            channelData: { streamId: 's', streamType: 'final' },
            id,
            text: id,
            timestamp: new Date(timestamp).toISOString(),
            type: 'message'
          }
        : {
            channelData:
              id === 's'
                ? { streamSequence: 1, streamType: 'streaming' }
                : { streamId: 's', streamSequence: sequence, streamType: 'streaming' },
            id,
            text: id,
            timestamp: new Date(timestamp).toISOString(),
            type: 'typing'
          }
    ),
    ...extra
  } as WebChatActivity;
}

function message(id: string, timestamp: number): WebChatActivity {
  return buildActivity({
    channelData: undefined,
    id,
    text: id,
    timestamp: new Date(timestamp).toISOString(),
    type: 'message'
  });
}

const upsertAll = (state: State, ...activities: readonly WebChatActivity[]) =>
  activities.reduce((state, activity) => upsert({ Date }, state, activity), state);

const deleteAll = (state: State, ...ids: readonly string[]) =>
  ids.reduce((state, id) => deleteActivityByLocalId(state, parse(LocalIdSchema, `_:${id}`)), state);

const ids = (state: State) => state.sortedActivities.map(({ id }) => id);

// A host can dispatch `DIRECT_LINE/DELETE_ACTIVITY`. As before the store, a session that lost every revision is gone:
// the next revision starts a new session.
scenario('deleting every revision of a livestream session, then a new revision arrives', bdd => {
  bdd
    .given('a session whose only revision was deleted', () =>
      deleteAll(upsertAll(INITIAL_STATE, revision('s', 1, 1_000)), 's')
    )
    .when('revision 2 arrives', state => upsertAll(state, revision('s-2', 2, 2_000)))
    .then('should show revision 2', (_, state) => expect(ids(state)).toEqual(['s-2']))
    .and('should start a new session with the timestamp of revision 2', (_, state) =>
      expect(state.livestreamSessionMap.get('s' as LivestreamSessionId)).toEqual({
        activities: [
          { activityLocalId: '_:s-2' as LocalId, logicalTimestamp: 2_000, sequenceNumber: 2, type: 'activity' }
        ],
        finalized: false,
        logicalTimestamp: 2_000
      })
    )
    .when('revision 3 arrives', (_, state) => upsertAll(state, revision('s-3', 3, 3_000)))
    .then('should show revisions 2 and 3', (_, state) => expect(ids(state)).toEqual(['s-2', 's-3']));

  bdd
    .given('a session whose 2 revisions were deleted', () =>
      deleteAll(upsertAll(INITIAL_STATE, revision('s', 1, 1_000), revision('s-2', 2, 2_000)), 's', 's-2')
    )
    .when('revision 3 arrives', state => upsertAll(state, revision('s-3', 3, 3_000)))
    .then('should show revision 3', (_, state) => expect(ids(state)).toEqual(['s-3']));

  bdd
    .given('a session in a HowTo, whose only revision was deleted', () =>
      deleteAll(
        upsertAll(
          INITIAL_STATE,
          revision('s', 1, 1_000, {
            entities: [
              {
                '@context': 'https://schema.org',
                '@id': '',
                '@type': 'Message',
                isPartOf: { '@id': '_:h', '@type': 'HowTo' },
                position: 1,
                type: 'https://schema.org/Message'
              }
            ]
          })
        ),
        's'
      )
    )
    .when('revision 2 arrives without `isPartOf`', state => upsertAll(state, revision('s-2', 2, 2_000)))
    .then('should show revision 2', (_, state) => expect(ids(state)).toEqual(['s-2']));

  bdd
    .given('a concluded session whose revisions were all deleted', () =>
      deleteAll(upsertAll(INITIAL_STATE, revision('s', 1, 1_000), revision('s-f', undefined, 2_000)), 's', 's-f')
    )
    .when('revision 2 arrives', state => upsertAll(state, revision('s-2', 2, 3_000)))
    .then('should show revision 2', (_, state) => expect(ids(state)).toEqual(['s-2']))
    .when('revision 3 arrives', (_, state) => upsertAll(state, revision('s-3', 3, 4_000)))
    .then('should show revisions 2 and 3', (_, state) => expect(ids(state)).toEqual(['s-2', 's-3']))
    .when('a new final revision arrives', (_, state) => upsertAll(state, revision('s-f2', undefined, 5_000)))
    .then('should show the new final revision only', (_, state) => expect(ids(state)).toEqual(['s-f2']));

  bdd
    .given('m (5s) after a session whose only revision (1s) was deleted', () =>
      deleteAll(upsertAll(INITIAL_STATE, revision('s', 1, 1_000), message('m', 5_000)), 's')
    )
    .when('revision 2 arrives at 9s', state => upsertAll(state, revision('s-2', 2, 9_000)))
    .then('should sort the new session by revision 2, after m', (_, state) => expect(ids(state)).toEqual(['m', 's-2']));
});
