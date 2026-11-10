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

// Ported from `deleteActivityByLocalId.livestream.spec.ts` of `botframework-webchat-core`.

type LivestreamActivityInit =
  | {
      readonly channelData: { readonly streamId: string; readonly streamType: 'final' };
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

function buildActivity(activity: LivestreamActivityInit) {
  return Object.freeze({ from: Object.freeze({ id: 'bot', role: 'bot' }), ...activity });
}

scenario(
  'deleting an activity',
  bdd => {
    const activity1 = buildActivity({
      channelData: { streamSequence: 1, streamType: 'streaming' },
      id: 'a-00001',
      text: 'A quick',
      timestamp: toISOString(1_000),
      type: 'typing'
    });

    const activity2 = buildActivity({
      channelData: { streamId: 'a-00001', streamSequence: 2, streamType: 'streaming' },
      id: 'a-00002',
      text: 'A quick brown fox',
      timestamp: toISOString(2_000),
      type: 'typing'
    });

    const activity3 = buildActivity({
      channelData: { streamId: 'a-00001', streamType: 'final' },
      id: 'a-00003',
      text: 'A quick brown fox jumped over the lazy dogs.',
      timestamp: toISOString(3_000),
      type: 'message'
    });

    bdd
      .given('a Direct Line store', () => createTestStore())
      .when('3 activities are upserted', ({ emitActivity }) => {
        emitActivity(activity1);
        emitActivity(activity2);
        emitActivity(activity3);
      })
      .then('should have 3 activities in graph, 1 visible', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(3);
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00003', dateCreated: toISOString(3_000) }]);
        expect(isPartOfConversation(store, 'a-00001')).toBe(false);
        expect(isPartOfConversation(store, 'a-00002')).toBe(false);
      })
      .when('the last activity is delete', ({ emitActivity, store }) =>
        deleteActivity(emitActivity, getSortedActivityIds(store)[0])
      )
      .then('should have 2 activities', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(2);
        expect(getActivityNode(store, 'a-00003')).toBeUndefined();
      })
      .and('should bring back revisions of the ongoing livestream session', ({ store }) => {
        expect(isPartOfConversation(store, 'a-00001')).toBe(true);
        expect(isPartOfConversation(store, 'a-00002')).toBe(true);
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(1_000) },
          { activityId: 'a-00002', dateCreated: toISOString(1_001) }
        ]);
      })
      .when('all activities are delete', ({ emitActivity, store }) => {
        const [activityId1, activityId2] = getSortedActivityIds(store);

        deleteActivity(emitActivity, activityId2);
        deleteActivity(emitActivity, activityId1);
      })
      .then('should have no activities', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(0);
        expect(getSortedActivityIds(store)).toHaveLength(0);
      });
  },
  NodeTest
);
