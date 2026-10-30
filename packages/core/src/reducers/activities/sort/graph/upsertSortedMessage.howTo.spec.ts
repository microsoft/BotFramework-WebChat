// Moved from `packages/store` (phase 3): the graph-level HowTo rules, with the inputs of `upsert.howTo.spec.ts`.
// HowTo grouping ID and position are given as the source extracts them (core's `getPartGroupingMetadataMap`).
//
// Intentional difference: positions are relative to the parent (`isPartOf`), so the expectations check order, not
// core's flattened position numbers.
import { scenario } from '@testduet/given-when-then';
import {
  buildMessage,
  CONVERSATION_ID,
  createSortedTestStore,
  getIntegrityViolations,
  getPartIds,
  getView,
  upsertEach
} from './private/sortTestHelpers';
import { getHowToNodeId, LOGICAL_TIMESTAMP } from './vocabulary';

const HOW_TO_1 = getHowToNodeId('_:how-to:00001');
const HOW_TO_2 = getHowToNodeId('_:how-to:00002');

scenario('upserting plain activity in the same grouping', bdd => {
  const message1 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 1 },
    id: 'a-00001',
    logicalTimestamp: 1_000,
    text: 'Hello, World!'
  });

  const message2 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 3 },
    id: 'a-00002',
    logicalTimestamp: 2_000,
    text: 'Aloha!'
  });

  const message3 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 2 },
    id: 'a-00003',
    logicalTimestamp: 3_000,
    text: 'Aloha!'
  });

  bdd
    .given('an empty store', () => createSortedTestStore())
    .when('upserted', testStore => upsertEach(testStore, message1))
    .then('should add a HowTo to the conversation', (_, testStore) =>
      expect(getPartIds(testStore, CONVERSATION_ID)).toEqual([HOW_TO_1])
    )
    .and('should add the activity to the HowTo', (_, testStore) =>
      expect(getPartIds(testStore, HOW_TO_1)).toEqual(['_:a-00001'])
    )
    .and('should have the HowTo timestamp of its only part', (_, { store }) =>
      expect(store.getSnapshot().get(HOW_TO_1)).toHaveProperty([LOGICAL_TIMESTAMP], [1_000])
    )
    .when('upsert another activity into same group', (_, testStore) => upsertEach(testStore, message2))
    .then('should show both', (_, testStore) =>
      expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00001', '_:a-00002'])
    )
    .and('should have the HowTo timestamp of its latest part', (_, { store }) =>
      expect(store.getSnapshot().get(HOW_TO_1)).toHaveProperty([LOGICAL_TIMESTAMP], [2_000])
    )
    .when('the third activity is upserted', (_, testStore) => upsertEach(testStore, message3))
    // Position 2 goes between position 1 and 3, although it arrived last.
    .then('should sort by position in the HowTo', (_, testStore) =>
      expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00001', '_:a-00003', '_:a-00002'])
    )
    .and('should keep a single HowTo in the conversation', (_, testStore) =>
      expect(getPartIds(testStore, CONVERSATION_ID)).toEqual([HOW_TO_1])
    )
    .and('should keep the graph integrity', (_, { store }) =>
      expect(getIntegrityViolations(store.getSnapshot())).toEqual([])
    );
});

scenario('upserting plain activity in two different grouping', bdd => {
  const message1 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 1 },
    id: 'a-00001',
    logicalTimestamp: 1_000,
    text: 'Hello, World!'
  });

  const message2 = buildMessage({
    howTo: { groupingId: '_:how-to:00002', position: 1 },
    id: 'a-00002',
    logicalTimestamp: 500,
    text: 'Aloha!'
  });

  bdd
    .given('an empty store', () => createSortedTestStore())
    .when('upserted', testStore => upsertEach(testStore, message1))
    .then('should show the activity', (_, testStore) =>
      expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00001'])
    )
    .when('upsert another activity into another group with a former timestamp', (_, testStore) =>
      upsertEach(testStore, message2)
    )
    .then('should put the second HowTo first in the conversation', (_, testStore) =>
      expect(getPartIds(testStore, CONVERSATION_ID)).toEqual([HOW_TO_2, HOW_TO_1])
    )
    .and('should show the activity of the second HowTo first', (_, testStore) =>
      expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00002', '_:a-00001'])
    )
    .and('should keep the graph integrity', (_, { store }) =>
      expect(getIntegrityViolations(store.getSnapshot())).toEqual([])
    );
});

scenario('updating an activity out of its grouping', bdd => {
  const message1 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 1 },
    id: 'a-00001',
    logicalTimestamp: 1_000,
    text: 'Hello, World!'
  });

  const message2 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 2 },
    id: 'a-00002',
    logicalTimestamp: 2_000,
    text: 'Aloha!'
  });

  const message3 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 3 },
    id: 'a-00003',
    logicalTimestamp: 3_000,
    text: 'Bonjour!'
  });

  // Same ID as message2, without `howTo`.
  const nextMessage2 = buildMessage({ id: 'a-00002', logicalTimestamp: 2_000, text: 'Aloha! (updated)' });

  bdd
    .given('3 activities in a grouping', () => createSortedTestStore(message1, message2, message3))
    .when('the second activity is updated without `isPartOf`', testStore => upsertEach(testStore, nextMessage2))
    .then('should remove it from the grouping', (_, testStore) =>
      expect(getPartIds(testStore, HOW_TO_1)).toEqual(['_:a-00001', '_:a-00003'])
    )
    .and('should keep the HowTo timestamp at its latest part', (_, { store }) =>
      expect(store.getSnapshot().get(HOW_TO_1)).toHaveProperty([LOGICAL_TIMESTAMP], [3_000])
    )
    // t=2000 is before the HowTo (t=3000, its latest part).
    .and('should appear in the conversation on its own, before the grouping', (_, testStore) =>
      expect(getPartIds(testStore, CONVERSATION_ID)).toEqual(['_:a-00002', HOW_TO_1])
    )
    .and('should show every activity once', (_, testStore) =>
      expect(getView(testStore).map(({ text }) => text)).toEqual([
        ['Aloha! (updated)'],
        ['Hello, World!'],
        ['Bonjour!']
      ])
    )
    .and('should keep the graph integrity', (_, { store }) =>
      expect(getIntegrityViolations(store.getSnapshot())).toEqual([])
    );
});

scenario('updating an activity into another grouping', bdd => {
  const message1 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 1 },
    id: 'a-00001',
    logicalTimestamp: 1_000,
    text: 'Hello, World!'
  });

  const message2 = buildMessage({
    howTo: { groupingId: '_:how-to:00002', position: 1 },
    id: 'a-00002',
    logicalTimestamp: 2_000,
    text: 'Aloha!'
  });

  // Same ID as message1, moved to the second grouping.
  const nextMessage1 = buildMessage({
    howTo: { groupingId: '_:how-to:00002', position: 2 },
    id: 'a-00001',
    logicalTimestamp: 1_000,
    text: 'Hello, World! (updated)'
  });

  bdd
    .given('2 groupings with an activity each', () => createSortedTestStore(message1, message2))
    .when('the first activity is updated into the second grouping', testStore => upsertEach(testStore, nextMessage1))
    .then('should add it to the second grouping', (_, testStore) =>
      expect(getPartIds(testStore, HOW_TO_2)).toEqual(['_:a-00002', '_:a-00001'])
    )
    .and('should only have the second grouping in the conversation', (_, testStore) =>
      expect(getPartIds(testStore, CONVERSATION_ID)).toEqual([HOW_TO_2])
    )
    // The store cannot delete nodes yet: the emptied HowTo stays in the graph, outside of the conversation.
    .and('should detach the emptied grouping', (_, { store }) => {
      expect(store.getSnapshot().get(HOW_TO_1)).not.toHaveProperty('hasPart');
      expect(store.getSnapshot().get(HOW_TO_1)).not.toHaveProperty('isPartOf');
    })
    .and('should show every activity once', (_, testStore) =>
      expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00002', '_:a-00001'])
    )
    .and('should keep the graph integrity', (_, { store }) =>
      expect(getIntegrityViolations(store.getSnapshot())).toEqual([])
    );
});

scenario('updating an activity into a grouping', bdd => {
  const message1 = buildMessage({ id: 'a-00001', logicalTimestamp: 1_000, text: 'Hello, World!' });

  const message2 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 2 },
    id: 'a-00002',
    logicalTimestamp: 2_000,
    text: 'Aloha!'
  });

  // Same ID as message1, joining the grouping before message2.
  const nextMessage1 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 1 },
    id: 'a-00001',
    logicalTimestamp: 1_000,
    text: 'Hello, World! (updated)'
  });

  bdd
    .given('an activity and a grouping', () => createSortedTestStore(message1, message2))
    .when('the activity is updated into the grouping', testStore => upsertEach(testStore, nextMessage1))
    .then('should add it to the grouping', (_, testStore) =>
      expect(getPartIds(testStore, HOW_TO_1)).toEqual(['_:a-00001', '_:a-00002'])
    )
    .and('should no longer appear in the conversation on its own', (_, testStore) =>
      expect(getPartIds(testStore, CONVERSATION_ID)).toEqual([HOW_TO_1])
    )
    .and('should show every activity once', (_, testStore) =>
      expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00001', '_:a-00002'])
    )
    .and('should keep the graph integrity', (_, { store }) =>
      expect(getIntegrityViolations(store.getSnapshot())).toEqual([])
    );
});

scenario('updating an activity in the same grouping', bdd => {
  const message1 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 1 },
    id: 'a-00001',
    logicalTimestamp: 1_000,
    text: 'Hello, World!'
  });

  const message2 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 2 },
    id: 'a-00002',
    logicalTimestamp: 2_000,
    text: 'Aloha!'
  });

  // Same ID and grouping as message1.
  const nextMessage1 = buildMessage({
    howTo: { groupingId: '_:how-to:00001', position: 1 },
    id: 'a-00001',
    logicalTimestamp: 1_000,
    text: 'Hello, World! (updated)'
  });

  bdd
    .given('2 activities in a grouping', () => createSortedTestStore(message1, message2))
    .when('the first activity is updated', testStore => upsertEach(testStore, nextMessage1))
    .then('should keep the grouping as-is', (_, testStore) =>
      expect(getPartIds(testStore, HOW_TO_1)).toEqual(['_:a-00001', '_:a-00002'])
    )
    .and('should have the grouping once in the conversation', (_, testStore) =>
      expect(getPartIds(testStore, CONVERSATION_ID)).toEqual([HOW_TO_1])
    )
    .and('should have the updated activity in place', (_, testStore) =>
      expect(getView(testStore).map(({ text }) => text)).toEqual([['Hello, World! (updated)'], ['Aloha!']])
    );
});
