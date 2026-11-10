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

// Ported from `upsert.howTo.spec.ts` of `botframework-webchat-core`.

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
  'upserting plain activity in the same grouping',
  bdd => {
    const activity1 = buildActivity(
      { id: 'a-00001', text: 'Hello, World!', timestamp: toISOString(1_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      { id: 'a-00002', text: 'Aloha!', timestamp: toISOString(2_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 3 }
    );

    const activity3 = buildActivity(
      { id: 'a-00003', text: 'Aloha!', timestamp: toISOString(3_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
    );

    bdd
      .given('a Direct Line store', () => createTestStore())
      .when('upserted', ({ emitActivity }) => emitActivity(activity1))
      .then('should have the activity in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
      })
      .and('should match sorted activities', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00001', dateCreated: toISOString(1_000) }]);
      })
      .when('upsert another activity into same group', ({ emitActivity }) => emitActivity(activity2))
      .then('should have the activities in the nodes', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
      })
      .and('should update timestamp of the grouping to t=2000ms', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(2_000) },
          { activityId: 'a-00002', dateCreated: toISOString(2_001) }
        ]);
      })
      .when('the third activity is upserted', ({ emitActivity }) => emitActivity(activity3))
      .then('should have the activities in the nodes', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
        expect(getRawActivity(getActivityNode(store, 'a-00003'))).toEqual(activity3);
      })
      .and('should sort activities in the grouping by position', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(3_000) },
          { activityId: 'a-00003', dateCreated: toISOString(3_001) },
          { activityId: 'a-00002', dateCreated: toISOString(3_002) }
        ]);
      });
  },
  NodeTest
);

scenario(
  'upserting plain activity in two different grouping',
  bdd => {
    const activity1 = buildActivity(
      { id: 'a-00001', text: 'Hello, World!', timestamp: toISOString(1_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      { id: 'a-00002', text: 'Aloha!', timestamp: toISOString(500) },
      { isPartOf: [{ '@id': '_:how-to:00002', '@type': 'HowTo' }], position: 1 }
    );

    bdd
      .given('a Direct Line store', () => createTestStore())
      .when('upserted', ({ emitActivity }) => emitActivity(activity1))
      .then('should match sorted activities', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00001', dateCreated: toISOString(1_000) }]);
      })
      .when('upsert another activity into same group with a former timestamp', ({ emitActivity }) =>
        emitActivity(activity2)
      )
      .then('should have the activities in the nodes', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
      })
      .and('should sort the groupings by timestamp', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00002', dateCreated: toISOString(500) },
          { activityId: 'a-00001', dateCreated: toISOString(1_000) }
        ]);
      });
  },
  NodeTest
);

scenario(
  'updating an activity out of its grouping',
  bdd => {
    const activity1 = buildActivity(
      { id: 'a-00001', text: 'Hello, World!', timestamp: toISOString(1_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      { id: 'a-00002', text: 'Aloha!', timestamp: toISOString(2_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
    );

    const activity3 = buildActivity(
      { id: 'a-00003', text: 'Bonjour!', timestamp: toISOString(3_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 3 }
    );

    // Same ID as activity2, without `isPartOf`.
    const nextActivity2 = buildActivity(
      { id: 'a-00002', text: 'Aloha! (updated)', timestamp: toISOString(2_000) },
      undefined
    );

    bdd
      .given('3 activities in a grouping', () => createTestStore([activity1, activity2, activity3]))
      .when('the second activity is updated without `isPartOf`', ({ emitActivity }) => emitActivity(nextActivity2))
      .then('should have the updated activity in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(nextActivity2);
        expect(getActivityNode(store, 'a-00002')).toHaveProperty('text', ['Aloha! (updated)']);
      })
      .and('should have every activity once, with the updated activity out of the grouping', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00002', dateCreated: toISOString(2_000) },
          { activityId: 'a-00001', dateCreated: toISOString(3_000) },
          { activityId: 'a-00003', dateCreated: toISOString(3_001) }
        ]);
      });
  },
  NodeTest
);

scenario(
  'updating an activity into another grouping',
  bdd => {
    const activity1 = buildActivity(
      { id: 'a-00001', text: 'Hello, World!', timestamp: toISOString(1_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      { id: 'a-00002', text: 'Aloha!', timestamp: toISOString(2_000) },
      { isPartOf: [{ '@id': '_:how-to:00002', '@type': 'HowTo' }], position: 1 }
    );

    // Same ID as activity1, moved to the second grouping.
    const nextActivity1 = buildActivity(
      { id: 'a-00001', text: 'Hello, World! (updated)', timestamp: toISOString(1_000) },
      { isPartOf: [{ '@id': '_:how-to:00002', '@type': 'HowTo' }], position: 2 }
    );

    bdd
      .given('2 groupings with an activity each', () => createTestStore([activity1, activity2]))
      .when('the first activity is updated into the second grouping', ({ emitActivity }) => emitActivity(nextActivity1))
      .then('should have the updated activity in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(nextActivity1);
      })
      .and('should drop the emptied grouping and have every activity once in the second grouping', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00002', dateCreated: toISOString(2_000) },
          { activityId: 'a-00001', dateCreated: toISOString(2_001) }
        ]);
      });
  },
  NodeTest
);

scenario(
  'updating an activity into a grouping',
  bdd => {
    const activity1 = buildActivity({ id: 'a-00001', text: 'Hello, World!', timestamp: toISOString(1_000) }, undefined);

    const activity2 = buildActivity(
      { id: 'a-00002', text: 'Aloha!', timestamp: toISOString(2_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
    );

    // Same ID as activity1, joining the grouping before activity2.
    const nextActivity1 = buildActivity(
      { id: 'a-00001', text: 'Hello, World! (updated)', timestamp: toISOString(1_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    bdd
      .given('an activity and a grouping', () => createTestStore([activity1, activity2]))
      .when('the activity is updated into the grouping', ({ emitActivity }) => emitActivity(nextActivity1))
      .then('should have the updated activity in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(nextActivity1);
      })
      .and('should have every activity once in the grouping', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(2_000) },
          { activityId: 'a-00002', dateCreated: toISOString(2_001) }
        ]);
      });
  },
  NodeTest
);

scenario(
  'updating an activity in the same grouping',
  bdd => {
    const activity1 = buildActivity(
      { id: 'a-00001', text: 'Hello, World!', timestamp: toISOString(1_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      { id: 'a-00002', text: 'Aloha!', timestamp: toISOString(2_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
    );

    // Same ID and grouping as activity1.
    const nextActivity1 = buildActivity(
      { id: 'a-00001', text: 'Hello, World! (updated)', timestamp: toISOString(1_000) },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    bdd
      .given('2 activities in a grouping', () => createTestStore([activity1, activity2]))
      .when('the first activity is updated', ({ emitActivity }) => emitActivity(nextActivity1))
      .then('should have the updated activity in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(nextActivity1);
        expect(getActivityNode(store, 'a-00001')).toHaveProperty('text', ['Hello, World! (updated)']);
      })
      .and('should have the updated activity in place', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(2_000) },
          { activityId: 'a-00002', dateCreated: toISOString(2_001) }
        ]);
      });
  },
  NodeTest
);
