import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import {
  createTestStore,
  deleteActivity,
  getActivityNode,
  getNumActivityNode,
  getRawActivity,
  getSortedActivityIds,
  getSortedEntries,
  toISOString
} from './private/test/inspectDirectLineJSStore.ts';

// Ported from `deleteActivityByLocalId.howTo.spec.ts` of `botframework-webchat-core`.

type MessageEntityInit = {
  readonly isPartOf: readonly { readonly '@id': string; readonly '@type': string }[];
  readonly position: number;
};

function buildActivity(
  activity: { readonly id: string; readonly text: string; readonly timestamp: string },
  messageEntity: MessageEntityInit | undefined
) {
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
    type: 'message',
    ...activity
  });
}

scenario(
  'deleting an activity in the same grouping',
  bdd => {
    const activity1 = buildActivity(
      { id: 'a-00001', text: 'Hello, World!', timestamp: toISOString(1_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      { id: 'a-00002', text: 'Aloha!', timestamp: toISOString(2_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
    );

    bdd
      .given('a Direct Line store', () => createTestStore())
      .when('2 activities are upserted', ({ emitActivity }) => {
        emitActivity(activity1);
        emitActivity(activity2);
      })
      .then('should have 2 activities in a grouping', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(2);
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(2_000) },
          { activityId: 'a-00002', dateCreated: toISOString(2_001) }
        ]);
      })
      .when('the second activity is deleted', ({ emitActivity, store }) =>
        deleteActivity(emitActivity, getSortedActivityIds(store)[1])
      )
      .then('should have 1 activity', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(1);
        expect(getSortedActivityIds(store)).toHaveLength(1);
      })
      .and('should keep the other activity in the node', ({ store }) => {
        expect(getActivityNode(store, 'a-00002')).toBeUndefined();
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
      })
      .and('should update timestamp of the grouping', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00001', dateCreated: toISOString(1_000) }]);
      })
      .when('the first activity is deleted', ({ emitActivity, store }) =>
        deleteActivity(emitActivity, getSortedActivityIds(store)[0])
      )
      .then('should have no activities', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(0);
        expect(getSortedActivityIds(store)).toHaveLength(0);
      });
  },
  NodeTest
);
