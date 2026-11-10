import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { getClientActivityIdentifier } from './private/activityIdentifier.ts';
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

// Ported from `deleteActivityByLocalId.activity.spec.ts` of `botframework-webchat-core`.

scenario(
  'deleting activity',
  bdd => {
    const activity1 = {
      from: { id: 'bot', role: 'bot' },
      id: 'a-00001',
      text: 'Hello, World!',
      timestamp: toISOString(1_000),
      type: 'message'
    };

    const activity2 = {
      from: { id: 'bot', role: 'bot' },
      id: 'a-00002',
      text: 'Aloha!',
      timestamp: toISOString(2_000),
      type: 'message'
    };

    bdd
      .given('a Direct Line store', () => createTestStore())
      .when('2 activities are upserted', ({ emitActivity }) => {
        emitActivity(activity1);
        emitActivity(activity2);
      })
      .then('should have 2 activities', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(2);
        expect(getSortedActivityIds(store)).toEqual(['a-00001', 'a-00002']);
      })
      .when('the first activity is deleted', ({ emitActivity, store }) =>
        deleteActivity(emitActivity, getSortedActivityIds(store)[0])
      )
      .then('should have 1 activity', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(1);
        expect(getSortedActivityIds(store)).toHaveLength(1);
      })
      .and('should not be queryable by activity ID of the deleted activity', ({ store }) => {
        expect(getActivityNode(store, 'a-00001')).toBeUndefined();
        expect(getActivityNode(store, 'a-00002')).toBeTruthy();
      })
      .and('should keep the other activity in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
      })
      .and('should match sorted activities', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00002', dateCreated: toISOString(2_000) }]);
      });
  },
  NodeTest
);

scenario(
  'deleting an outgoing activity',
  bdd => {
    const activity1 = {
      channelData: { clientActivityID: 'caid-00001' },
      from: { id: 'user', role: 'user' },
      id: 'a-00001',
      text: 'Hello, World!',
      timestamp: toISOString(1_000),
      type: 'message'
    };

    bdd
      .given('a Direct Line store', () => createTestStore())
      .when('1 activity are upserted', ({ emitActivity }) => emitActivity(activity1))
      .then('should have 1 activity', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(1);
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00001', dateCreated: toISOString(1_000) }]);
      })
      .and('should be queryable by client activity ID', ({ store }) => {
        expect(store.queryByIdentifier(getClientActivityIdentifier('caid-00001'))).toBe(
          getActivityNode(store, 'a-00001')
        );
        expect(getActivityNode(store, 'a-00001')).toBeTruthy();
      })
      .when('the first activity is deleted', ({ emitActivity, store }) =>
        deleteActivity(emitActivity, getSortedActivityIds(store)[0])
      )
      .then('should have no activities', ({ store }) => {
        expect(getNumActivityNode(store)).toBe(0);
        expect(getSortedActivityIds(store)).toHaveLength(0);
        expect(getActivityNode(store, 'a-00001')).toBeUndefined();
        expect(store.queryByIdentifier(getClientActivityIdentifier('caid-00001'))).toBeUndefined();
      });
  },
  NodeTest
);
