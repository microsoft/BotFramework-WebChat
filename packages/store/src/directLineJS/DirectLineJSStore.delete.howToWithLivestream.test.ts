import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import {
  createTestStore,
  deleteActivity,
  getActivityNode,
  getNumActivityNode,
  getSortedActivityIds,
  getSortedEntries,
  isPartOfConversation,
  toISOString
} from './private/test/inspectDirectLineJSStore.ts';

// Ported from `deleteActivityByLocalId.howToWithLivestream.spec.ts` of `botframework-webchat-core`.

type ActivityInit =
  | {
      readonly channelData?: { readonly streamId: string; readonly streamType: 'final' } | undefined;
      readonly id: string;
      readonly text: string;
      readonly timestamp: string;
      readonly type: 'message';
    }
  | {
      readonly channelData:
        | {
            readonly streamId: string;
            readonly streamSequence: number;
            readonly streamType: 'informative' | 'streaming';
          }
        | { readonly streamSequence: 1; readonly streamType: 'informative' | 'streaming' };
      readonly id: string;
      readonly text: string;
      readonly timestamp: string;
      readonly type: 'typing';
    };

type MessageEntityInit = {
  readonly isPartOf: readonly { readonly '@id': string; readonly '@type': string }[];
  readonly position: number;
};

function buildActivity(activity: ActivityInit, messageEntity: MessageEntityInit | undefined) {
  return Object.freeze({
    ...(messageEntity
      ? {
          entities: Object.freeze([
            Object.freeze({
              '@context': 'https://schema.org',
              '@id': '',
              '@type': 'Message',
              type: 'https://schema.org/Message',
              ...messageEntity
            })
          ])
        }
      : {}),
    from: Object.freeze({ id: 'bot', role: 'bot' }),
    ...activity
  });
}

scenario(
  'delete livestream activities in part grouping',
  bdd => {
    const activity1 = buildActivity(
      {
        channelData: { streamSequence: 1, streamType: 'streaming' },
        id: 'a-00001',
        text: 'A quick',
        timestamp: toISOString(1_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamSequence: 2, streamType: 'streaming' },
        id: 'a-00002',
        text: 'A quick brown fox',
        timestamp: toISOString(2_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity3 = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamType: 'final' },
        id: 'a-00003',
        text: 'A quick brown fox jumped over the lazy dogs.',
        timestamp: toISOString(3_000),
        type: 'message'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity4 = buildActivity(
      { id: 'a-00004', text: 'Hello, World!', timestamp: toISOString(4_000), type: 'message' },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
    );

    bdd
      .given('a Direct Line store', () => createTestStore())
      .when('4 activities are upserted', ({ emitActivity }) => {
        emitActivity(activity1);
        emitActivity(activity2);
        emitActivity(activity3);
        emitActivity(activity4);
      })
      .then('should have 4 activities in graph, 2 visible', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(4);
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00003', dateCreated: toISOString(4_000) },
          { activityId: 'a-00004', dateCreated: toISOString(4_001) }
        ]);
        expect(isPartOfConversation(store, 'a-00001')).toBe(false);
        expect(isPartOfConversation(store, 'a-00002')).toBe(false);
      })
      .when('the last livestream activity is delete', ({ emitActivity, store }) =>
        deleteActivity(emitActivity, getSortedActivityIds(store)[0])
      )
      .then('should have 3 activities', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(3);
        expect(getActivityNode(store, 'a-00003')).toBeUndefined();
      })
      .and('should bring back revisions of the ongoing livestream session in the grouping', ({ store }) => {
        // Timestamp of the grouping is the latest of its parts, i.e. t=4000ms of the 4th activity.
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(4_000) },
          { activityId: 'a-00002', dateCreated: toISOString(4_001) },
          { activityId: 'a-00004', dateCreated: toISOString(4_002) }
        ]);
      })
      .when('all livestream activities are delete', ({ emitActivity, store }) => {
        const [activityId1, activityId2] = getSortedActivityIds(store);

        deleteActivity(emitActivity, activityId2);
        deleteActivity(emitActivity, activityId1);
      })
      .then('should have 1 activity', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(1);
        expect(getActivityNode(store, 'a-00001')).toBeUndefined();
        expect(getActivityNode(store, 'a-00002')).toBeUndefined();
      })
      .and('should keep the grouping with the remaining activity', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00004', dateCreated: toISOString(4_000) }]);
      })
      .when('all activities are delete', ({ emitActivity, store }) =>
        deleteActivity(emitActivity, getSortedActivityIds(store)[0])
      )
      .then('should have no activities', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(0);
        expect(getSortedActivityIds(store)).toHaveLength(0);
      });
  },
  NodeTest
);
