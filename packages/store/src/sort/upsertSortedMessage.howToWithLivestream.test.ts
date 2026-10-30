// Ported from `packages/core/src/reducers/activities/sort/upsert.howToWithLivestream.spec.ts`: same inputs and order.
//
// Intentional difference: positions are relative to the parent (`isPartOf`), so the expectations check order, not
// core's flattened position numbers.
import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { SortableMessage } from './SortableMessage.ts';
import {
  buildMessage,
  CONVERSATION_ID,
  createSortedTestStore,
  getIntegrityViolations,
  getPartIds,
  getView,
  upsertEach
} from '../testHelpers/sortTestHelpers.ts';
import { getHowToNodeId, getLivestreamSessionNodeId, LOGICAL_TIMESTAMP } from './vocabulary.ts';

const HOW_TO_1 = getHowToNodeId('_:how-to:00001');
const SESSION_NODE_ID = getLivestreamSessionNodeId('a-00001');

/** A revision of livestream session "a-00001"; `sequenceNumber` of `undefined` is the final revision. */
function buildRevision(
  id: string,
  sequenceNumber: number | undefined,
  logicalTimestamp: number,
  text: string,
  { inHowTo }: { readonly inHowTo: boolean }
): SortableMessage {
  return buildMessage({
    ...(inHowTo ? { howTo: { groupingId: '_:how-to:00001', position: 1 } } : {}),
    id,
    livestream:
      typeof sequenceNumber === 'undefined'
        ? { final: true, sessionId: 'a-00001' }
        : { final: false, sequenceNumber, sessionId: 'a-00001' },
    logicalTimestamp,
    text
  });
}

scenario(
  'upserting plain activity in the same grouping',
  bdd => {
    const message1 = buildRevision('a-00001', 1, 1_000, 'A quick', { inHowTo: true });
    const message2 = buildRevision('a-00002', 2, 2_000, 'A quick brown fox', { inHowTo: true });
    const message3 = buildRevision('a-00003', undefined, 3_000, 'A quick brown fox jumped over the lazy dogs.', {
      inHowTo: true
    });

    bdd
      .given('an empty store', () => createSortedTestStore())
      .when('the first activity is upserted', testStore => upsertEach(testStore, message1))
      .then('should put the session in the HowTo, and the HowTo in the conversation', (_, testStore) => {
        expect(getPartIds(testStore, CONVERSATION_ID)).toEqual([HOW_TO_1]);
        expect(getPartIds(testStore, HOW_TO_1)).toEqual([SESSION_NODE_ID]);
        expect(getPartIds(testStore, SESSION_NODE_ID)).toEqual(['_:a-00001']);
      })
      .and('should show the first revision', (_, testStore) =>
        expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00001'])
      )
      .when('the second activity is upserted', (_, testStore) => upsertEach(testStore, message2))
      .then('should show 2 revisions', (_, testStore) =>
        expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00001', '_:a-00002'])
      )
      .and('should not change the HowTo timestamp', (_, { store }) =>
        expect(store.getSnapshot().get(HOW_TO_1)).toHaveProperty([LOGICAL_TIMESTAMP], [1_000])
      )
      .when('the third activity is upserted', (_, testStore) => upsertEach(testStore, message3))
      .then('should only show the final revision', (_, testStore) =>
        expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00003'])
      )
      .and('should update the HowTo timestamp to the final revision', (_, { store }) =>
        expect(store.getSnapshot().get(HOW_TO_1)).toHaveProperty([LOGICAL_TIMESTAMP], [3_000])
      )
      .and('should keep the graph integrity', (_, { store }) =>
        expect(getIntegrityViolations(store.getSnapshot())).toEqual([])
      );
  },
  NodeTest
);

scenario(
  're-sending the final revision of a livestream in a grouping without `isPartOf`',
  bdd => {
    const message1 = buildRevision('a-00001', 1, 1_000, 'A quick', { inHowTo: true });
    const message2 = buildRevision('a-00002', undefined, 2_000, 'A quick brown fox.', { inHowTo: true });

    // Same ID as the final revision, without `isPartOf`.
    const message2WithoutGrouping = buildRevision('a-00002', undefined, 2_000, 'A quick brown fox.', {
      inHowTo: false
    });

    bdd
      .given('a finalized livestream session in a part grouping', () => createSortedTestStore(message1, message2))
      .when('the final revision is re-sent without `isPartOf`', testStore =>
        upsertEach(testStore, message2WithoutGrouping)
      )
      .then('the conversation should only have the part grouping', (_, testStore) =>
        expect(getPartIds(testStore, CONVERSATION_ID)).toEqual([HOW_TO_1])
      )
      .and('the final revision should be shown once', (_, testStore) =>
        expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00002'])
      );
  },
  NodeTest
);

scenario(
  're-sending an older revision of a finalized livestream in a grouping without `isPartOf`',
  bdd => {
    const message1 = buildRevision('a-00001', 1, 1_000, 'A quick', { inHowTo: true });
    const message2 = buildRevision('a-00002', 2, 2_000, 'A quick brown fox', { inHowTo: true });
    const message3 = buildRevision('a-00003', undefined, 3_000, 'A quick brown fox jumped over the lazy dogs.', {
      inHowTo: true
    });

    // Same ID as the second revision, without `isPartOf`.
    const message2WithoutGrouping = buildRevision('a-00002', 2, 2_000, 'A quick brown fox', { inHowTo: false });

    bdd
      .given('a finalized livestream session in a part grouping', () =>
        createSortedTestStore(message1, message2, message3)
      )
      .when('the second revision is re-sent without `isPartOf`', testStore =>
        upsertEach(testStore, message2WithoutGrouping)
      )
      .then('should keep the second revision in the session', (_, testStore) =>
        expect(getPartIds(testStore, SESSION_NODE_ID)).toEqual(['_:a-00001', '_:a-00002', '_:a-00003'])
      )
      .and('the final revision should be shown once', (_, testStore) =>
        expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00003'])
      );
  },
  NodeTest
);

scenario(
  're-sending a revision of an ongoing livestream in a grouping',
  bdd => {
    const message1 = buildRevision('a-00001', 1, 1_000, 'A quick', { inHowTo: true });
    const message2 = buildRevision('a-00002', 2, 2_000, 'A quick brown fox', { inHowTo: true });
    const message2Changed = buildRevision('a-00002', 2, 2_000, 'a-00002:CHANGED', { inHowTo: true });

    bdd
      .given('an ongoing livestream session with 2 revisions in a part grouping', () =>
        createSortedTestStore(message1, message2)
      )
      .when('the second revision is re-sent with a changed text', testStore => upsertEach(testStore, message2Changed))
      .then('should keep 2 revisions in the session', (_, testStore) =>
        expect(getPartIds(testStore, SESSION_NODE_ID)).toEqual(['_:a-00001', '_:a-00002'])
      )
      .and('should show the changed revision once', (_, testStore) =>
        expect(getView(testStore).map(({ text }) => text)).toEqual([['A quick'], ['a-00002:CHANGED']])
      );
  },
  NodeTest
);

scenario(
  're-sending a middle revision of an ongoing livestream in a grouping',
  bdd => {
    const message1 = buildRevision('a-00001', 1, 1_000, 'A quick', { inHowTo: true });
    const message2 = buildRevision('a-00002', 2, 2_000, 'A quick brown fox', { inHowTo: true });
    const message3 = buildRevision('a-00003', 3, 3_000, 'A quick brown fox jumped', { inHowTo: true });
    const message2Changed = buildRevision('a-00002', 2, 2_000, 'a-00002:CHANGED', { inHowTo: true });

    bdd
      .given('an ongoing livestream session with 3 revisions in a part grouping', () =>
        createSortedTestStore(message1, message2, message3)
      )
      .when('the second revision is re-sent with a changed text', testStore => upsertEach(testStore, message2Changed))
      .then('should show the changed revision once, before the third revision', (_, testStore) =>
        expect(getView(testStore).map(({ text }) => text)).toEqual([
          ['A quick'],
          ['a-00002:CHANGED'],
          ['A quick brown fox jumped']
        ])
      )
      .and('should keep the graph integrity', (_, { store }) =>
        expect(getIntegrityViolations(store.getSnapshot())).toEqual([])
      );
  },
  NodeTest
);

// New: same data as html2 `activityOrdering/partGroupingShouldUseMaxTimestamp.html` (no unit test in core).
// Core gives the same order (measured in `~/webchat-tools/scratch/new-store/core-parity-probe.log`).
scenario(
  'a grouping with a livestream sorts by its latest part',
  bdd => {
    const howTo = { groupingId: '_:c-00001' };

    bdd
      .given('a livestream (t=0, t=10) and a message (t=20) in a position-less grouping', () =>
        createSortedTestStore(
          buildMessage({
            howTo,
            id: 'a-00001',
            livestream: { final: false, sequenceNumber: 1, sessionId: 'a-00001' },
            logicalTimestamp: 0,
            text: 'Task 1 at t=0'
          }),
          buildMessage({
            howTo,
            id: 'a-00002',
            livestream: { final: false, sequenceNumber: 2, sessionId: 'a-00001' },
            logicalTimestamp: 10,
            text: 'Task 1 at t=10'
          }),
          buildMessage({ howTo, id: 'a-00003', logicalTimestamp: 20, text: 'Task 2 at t=20' })
        )
      )
      .when('a message at t=15 is upserted', testStore =>
        upsertEach(testStore, buildMessage({ id: 'a-00004', logicalTimestamp: 15, text: 'Hello, World at t=15' }))
      )
      // The grouping sorts by its latest part (t=20), so t=15 goes before the grouping.
      .then('should show the message before the grouping', (_, testStore) =>
        expect(getView(testStore).map(({ text }) => text)).toEqual([
          ['Hello, World at t=15'],
          ['Task 1 at t=0'],
          ['Task 1 at t=10'],
          ['Task 2 at t=20']
        ])
      );
  },
  NodeTest
);

// Intentional difference (not pinned in core): core lists the session twice, in the HowTo and on its own
// (`["r1","r2 resent","r1","r2 resent"]`, measured in `~/webchat-tools/scratch/new-store/core-parity-probe.log`).
// Here the session leaves the HowTo, like a plain activity does (#5967).
scenario(
  're-sending a revision of an ongoing livestream in a grouping without `isPartOf`',
  bdd => {
    bdd
      .given('an ongoing livestream session with 2 revisions in a part grouping', () =>
        createSortedTestStore(
          buildRevision('a-00001', 1, 1_000, 'r1', { inHowTo: true }),
          buildRevision('a-00002', 2, 2_000, 'r2', { inHowTo: true })
        )
      )
      .when('the second revision is re-sent without `isPartOf`', testStore =>
        upsertEach(testStore, buildRevision('a-00002', 2, 2_000, 'r2 resent', { inHowTo: false }))
      )
      .then('should move the session out of the HowTo', (_, testStore) =>
        expect(getPartIds(testStore, CONVERSATION_ID)).toEqual([SESSION_NODE_ID])
      )
      .and('should show each revision once', (_, testStore) =>
        expect(getView(testStore).map(({ text }) => text)).toEqual([['r1'], ['r2 resent']])
      )
      .and('should keep the graph integrity', (_, { store }) =>
        expect(getIntegrityViolations(store.getSnapshot())).toEqual([])
      );
  },
  NodeTest
);
