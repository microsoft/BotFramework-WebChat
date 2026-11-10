import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import {
  createTestStore,
  getActivityNode,
  getRawActivity,
  getSortedEntries,
  toISOString
} from './private/test/inspectDirectLineJSStore.ts';

// Ported from `upsert.activity.spec.ts` of `botframework-webchat-core`.

scenario(
  'upserting 2 activities with timestamps',
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
      timestamp: toISOString(500),
      type: 'message'
    };

    bdd
      .given('a Direct Line store', () => createTestStore())
      .when('upserted', ({ emitActivity }) => emitActivity(activity1))
      .then('should be queryable by activity ID', ({ store }) => {
        expect(getActivityNode(store, 'a-00001')).toBeTruthy();
      })
      .and('should have the activity in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
      })
      .and('should match sorted activities', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00001', dateCreated: toISOString(1_000) }]);
      })
      .when('another activity is upserted', ({ emitActivity }) => emitActivity(activity2))
      .then('should be queryable by activity ID', ({ store }) => {
        expect(getActivityNode(store, 'a-00001')).toBeTruthy();
        expect(getActivityNode(store, 'a-00002')).toBeTruthy();
      })
      .and('should have the activities in the nodes', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
      })
      .and('should match sorted activities', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00002', dateCreated: toISOString(500) },
          { activityId: 'a-00001', dateCreated: toISOString(1_000) }
        ]);
      });
  },
  NodeTest
);

scenario(
  'upserting activities which some with timestamp and some without',
  bdd => {
    const activity1 = {
      from: { id: 'bot', role: 'bot' },
      id: 'a-00001',
      text: 't=1000ms',
      timestamp: toISOString(1_000),
      type: 'message'
    };

    const activity2 = {
      from: { id: 'bot', role: 'bot' },
      id: 'a-00002',
      text: 't=undefined',
      type: 'message'
    };

    const activity3 = {
      from: { id: 'bot', role: 'bot' },
      id: 'a-00003',
      text: 't=2_000ms',
      timestamp: toISOString(2_000),
      type: 'message'
    };

    const activity4 = {
      from: { id: 'bot', role: 'bot' },
      id: 'a-00004',
      text: 't=1500ms',
      timestamp: toISOString(1_500),
      type: 'message'
    };

    const activity2b = { ...activity2, timestamp: toISOString(1_750) };

    bdd
      .given('a Direct Line store', () => createTestStore())
      .when('upserting an activity with t=1000ms', ({ emitActivity }) => emitActivity(activity1))
      .then('should have the activity in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
      })
      .and('should match sorted activities', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00001', dateCreated: toISOString(1_000) }]);
      })
      .when('upserting an activity with t=undefined', ({ emitActivity }) => emitActivity(activity2))
      .then('should have the activities in the nodes', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
      })
      .and('should append the activity without timestamp', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(1_000) },
          { activityId: 'a-00002', dateCreated: toISOString(1_001) }
        ]);
      })
      .when('upserting an activity with t=2_000ms', ({ emitActivity }) => emitActivity(activity3))
      .then('should have the activities in the nodes', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
        expect(getRawActivity(getActivityNode(store, 'a-00003'))).toEqual(activity3);
      })
      .and('should match sorted activities', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(1_000) },
          { activityId: 'a-00002', dateCreated: toISOString(1_001) },
          { activityId: 'a-00003', dateCreated: toISOString(2_000) }
        ]);
      })
      .when('upserting an activity with t=1500ms', ({ emitActivity }) => emitActivity(activity4))
      .then('should have the activities in the nodes', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
        expect(getRawActivity(getActivityNode(store, 'a-00003'))).toEqual(activity3);
        expect(getRawActivity(getActivityNode(store, 'a-00004'))).toEqual(activity4);
      })
      .and('should insert the activity after the activity without timestamp', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(1_000) },
          { activityId: 'a-00002', dateCreated: toISOString(1_001) },
          { activityId: 'a-00004', dateCreated: toISOString(1_500) },
          { activityId: 'a-00003', dateCreated: toISOString(2_000) }
        ]);
      })
      .when('upserting the t=undefined activity is updated with t=1750ms', ({ emitActivity }) =>
        emitActivity(activity2b)
      )
      .then('should have the updated activity in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2b);
      })
      .and('should move the updated activity', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(1_000) },
          { activityId: 'a-00004', dateCreated: toISOString(1_500) },
          { activityId: 'a-00002', dateCreated: toISOString(1_750) },
          { activityId: 'a-00003', dateCreated: toISOString(2_000) }
        ]);
      });
  },
  NodeTest
);
