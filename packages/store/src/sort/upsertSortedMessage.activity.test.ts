// Ported from `packages/core/src/reducers/activities/sort/upsert.activity.spec.ts`: same inputs, same order and positions.
// Timestamps are given in milliseconds: converting `activity.timestamp` stays with the source (core's `getLogicalTimestamp`).
import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import {
  buildMessage,
  createSortedTestStore,
  getIntegrityViolations,
  getView,
  upsertEach
} from '../testHelpers/sortTestHelpers.ts';

scenario(
  'upserting 2 activities with timestamps',
  bdd => {
    const message1 = buildMessage({ id: 'a-00001', logicalTimestamp: 1_000, text: 'Hello, World!' });
    const message2 = buildMessage({ id: 'a-00002', logicalTimestamp: 500, text: 'Aloha!' });

    bdd
      .given('an empty store', () => createSortedTestStore())
      .when('upserted', testStore => upsertEach(testStore, message1))
      .then('should be in the view at position 1000', (_, testStore) =>
        expect(getView(testStore)).toEqual([{ id: '_:a-00001', position: 1_000, text: ['Hello, World!'] }])
      )
      .when('another activity with an earlier timestamp is upserted', (_, testStore) => upsertEach(testStore, message2))
      .then('should be inserted before at position 1', (_, testStore) =>
        expect(getView(testStore)).toEqual([
          { id: '_:a-00002', position: 1, text: ['Aloha!'] },
          { id: '_:a-00001', position: 1_000, text: ['Hello, World!'] }
        ])
      )
      .and('should keep the graph integrity', (_, { store }) =>
        expect(getIntegrityViolations(store.getSnapshot())).toEqual([])
      )
      .and('should be part of the conversation', (_, { store }) =>
        expect(store.getSnapshot().get('_:a-00001')).toHaveProperty('isPartOf', new Set([{ '@id': '_:conversation' }]))
      );
  },
  NodeTest
);

scenario(
  'upserting activities which some with timestamp and some without',
  bdd => {
    const message1 = buildMessage({ id: 'a-00001', logicalTimestamp: 1_000, text: 't=1000ms' });
    const message2 = buildMessage({ id: 'a-00002', text: 't=undefined' });
    const message3 = buildMessage({ id: 'a-00003', logicalTimestamp: 2_000, text: 't=2_000ms' });
    const message4 = buildMessage({ id: 'a-00004', logicalTimestamp: 1_500, text: 't=1500ms' });
    const message2b = buildMessage({ id: 'a-00002', logicalTimestamp: 1_750, text: 't=undefined' });

    bdd
      .given('an empty store', () => createSortedTestStore())
      .when('upserting an activity with t=1000ms', testStore => upsertEach(testStore, message1))
      .then('should match', (_, testStore) =>
        expect(getView(testStore).map(({ id, position }) => [id, position])).toEqual([['_:a-00001', 1_000]])
      )
      .when('upserting an activity with t=undefined', (_, testStore) => upsertEach(testStore, message2))
      // An activity without timestamp is appended.
      .then('should be appended', (_, testStore) =>
        expect(getView(testStore).map(({ id, position }) => [id, position])).toEqual([
          ['_:a-00001', 1_000],
          ['_:a-00002', 2_000]
        ])
      )
      .when('upserting an activity with t=2_000ms', (_, testStore) => upsertEach(testStore, message3))
      .then('should be appended', (_, testStore) =>
        expect(getView(testStore).map(({ id, position }) => [id, position])).toEqual([
          ['_:a-00001', 1_000],
          ['_:a-00002', 2_000],
          ['_:a-00003', 3_000]
        ])
      )
      .when('upserting an activity with t=1500ms', (_, testStore) => upsertEach(testStore, message4))
      // Inserted before the first later activity (t=2000ms), after the activity without timestamp.
      .then('should be inserted before t=2000ms', (_, testStore) =>
        expect(getView(testStore).map(({ id, position }) => [id, position])).toEqual([
          ['_:a-00001', 1_000],
          ['_:a-00002', 2_000],
          ['_:a-00004', 2_001],
          ['_:a-00003', 3_000]
        ])
      )
      .when('upserting the t=undefined activity is updated with t=1750ms', (_, testStore) =>
        upsertEach(testStore, message2b)
      )
      .then('should be re-sorted', (_, testStore) =>
        expect(getView(testStore).map(({ id, position }) => [id, position])).toEqual([
          ['_:a-00001', 1_000],
          ['_:a-00004', 2_001],
          ['_:a-00002', 2_002],
          ['_:a-00003', 3_000]
        ])
      )
      .and('should keep the graph integrity', (_, { store }) =>
        expect(getIntegrityViolations(store.getSnapshot())).toEqual([])
      );
  },
  NodeTest
);

// New: core has no unit test for the `localTimestamp` fallback (`upsert.ts:423`).
// Core gives the same order (measured in `~/webchat-tools/scratch/new-store/core-parity-probe.log`).
scenario(
  'upserting activities without timestamp but with local timestamp',
  bdd => {
    bdd
      .given('2 activities without logical timestamp, the second one sent earlier', () =>
        createSortedTestStore(
          buildMessage({ id: 'a-00001', localTimestamp: 2_000, text: 'Second' }),
          buildMessage({ id: 'a-00002', localTimestamp: 1_000, text: 'First' })
        )
      )
      .when('the view is read', testStore => getView(testStore))
      .then('should sort by local timestamp', (_, view) =>
        expect(view.map(({ text }) => text)).toEqual([['First'], ['Second']])
      );
  },
  NodeTest
);
