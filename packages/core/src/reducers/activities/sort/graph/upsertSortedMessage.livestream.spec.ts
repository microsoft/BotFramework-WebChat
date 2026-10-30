// Moved from `packages/store` (phase 3): the graph-level livestream rules, with the inputs of
// `upsert.livestream.spec.ts`.
// Session ID and sequence number are given as the source extracts them (core's `getActivityLivestreamingMetadata`):
// the first revision's ID is the session ID.
//
// Intentional difference: positions are relative to the parent (`isPartOf`). Revisions are positioned inside their
// session, and the session inside the conversation; core numbers the flattened list, so the final revision is at 1000
// in core and the session is at 1000 here.
import { scenario } from '@testduet/given-when-then';
import {
  buildMessage,
  createSortedTestStore,
  getIntegrityViolations,
  getPartIds,
  getView,
  upsertEach
} from './private/sortTestHelpers';
import { getLivestreamSessionNodeId, LOGICAL_TIMESTAMP } from './vocabulary';

const SESSION_NODE_ID = getLivestreamSessionNodeId('a-00001');

scenario('upserting a livestream session', bdd => {
  const message1 = buildMessage({
    id: 'a-00001',
    livestream: { final: false, sequenceNumber: 1, sessionId: 'a-00001' },
    logicalTimestamp: 1_000,
    text: 'A quick'
  });

  const message2 = buildMessage({
    id: 'a-00002',
    // In reversed order.
    livestream: { final: false, sequenceNumber: 3, sessionId: 'a-00001' },
    logicalTimestamp: 3_000,
    text: 'A quick brown fox jumped over'
  });

  const message3 = buildMessage({
    id: 'a-00003',
    livestream: { final: false, sequenceNumber: 2, sessionId: 'a-00001' },
    logicalTimestamp: 2_000,
    text: 'A quick brown fox'
  });

  const message4 = buildMessage({
    id: 'a-00004',
    livestream: { final: true, sessionId: 'a-00001' },
    logicalTimestamp: 4_000,
    text: 'A quick brown fox jumped over the lazy dogs.'
  });

  bdd
    .given('an empty store', () => createSortedTestStore())
    .when('the first revision is upserted', testStore => upsertEach(testStore, message1))
    .then('should show the first revision', (_, testStore) =>
      expect(getView(testStore).map(({ id, position }) => [id, position])).toEqual([['_:a-00001', 1_000]])
    )
    .and('should have the session in the conversation with the timestamp of the first revision', (_, { store }) => {
      const session = store.getSnapshot().get(SESSION_NODE_ID);

      expect(session).toHaveProperty('isPartOf', new Set([{ '@id': '_:conversation' }]));
      expect(session).toHaveProperty('position', 1_000);
      expect(session).toHaveProperty([LOGICAL_TIMESTAMP], [1_000]);
    })
    .when('the second activity is upserted', (_, testStore) => upsertEach(testStore, message2))
    .then('should show 2 revisions', (_, testStore) =>
      expect(getView(testStore).map(({ id, position }) => [id, position])).toEqual([
        ['_:a-00001', 1_000],
        ['_:a-00002', 2_000]
      ])
    )
    .and('should not change the session timestamp', (_, { store }) =>
      expect(store.getSnapshot().get(SESSION_NODE_ID)).toHaveProperty([LOGICAL_TIMESTAMP], [1_000])
    )
    .when('the third activity is upserted', (_, testStore) => upsertEach(testStore, message3))
    // Sequence 2 goes between sequence 1 and 3.
    .then('should sort by sequence number', (_, testStore) =>
      expect(getView(testStore).map(({ id, position }) => [id, position])).toEqual([
        ['_:a-00001', 1_000],
        ['_:a-00003', 1_001],
        ['_:a-00002', 2_000]
      ])
    )
    .and('should not change the session timestamp', (_, { store }) =>
      expect(store.getSnapshot().get(SESSION_NODE_ID)).toHaveProperty([LOGICAL_TIMESTAMP], [1_000])
    )
    .when('the fourth and final activity is upserted', (_, testStore) => upsertEach(testStore, message4))
    .then('should only show the final revision', (_, testStore) =>
      expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00004'])
    )
    .and('should update the session timestamp to the final revision', (_, { store }) =>
      expect(store.getSnapshot().get(SESSION_NODE_ID)).toHaveProperty([LOGICAL_TIMESTAMP], [4_000])
    )
    .and('should keep the other revisions in the graph', (_, { store }) =>
      expect(['_:a-00001', '_:a-00002', '_:a-00003'].map(id => store.getSnapshot().has(id))).toEqual([true, true, true])
    )
    .and('should keep the graph integrity', (_, { store }) =>
      expect(getIntegrityViolations(store.getSnapshot())).toEqual([])
    );
});

scenario('re-sending a revision of an ongoing livestream session', bdd => {
  const message1 = buildMessage({
    id: 'a-00001',
    livestream: { final: false, sequenceNumber: 1, sessionId: 'a-00001' },
    logicalTimestamp: 1_000,
    text: 'A quick'
  });

  const message2 = buildMessage({
    id: 'a-00002',
    livestream: { final: false, sequenceNumber: 2, sessionId: 'a-00001' },
    logicalTimestamp: 2_000,
    text: 'A quick brown fox'
  });

  // Same ID with a changed text, e.g. delivered again after a reconnect.
  const message2Changed = buildMessage({
    id: 'a-00002',
    livestream: { final: false, sequenceNumber: 2, sessionId: 'a-00001' },
    logicalTimestamp: 2_000,
    text: 'a-00002:CHANGED'
  });

  bdd
    .given('an ongoing livestream session with 2 revisions', () => createSortedTestStore(message1, message2))
    .when('the second revision is re-sent with a changed text', testStore => upsertEach(testStore, message2Changed))
    .then('should keep 2 revisions in the session', (_, testStore) =>
      expect(getPartIds(testStore, SESSION_NODE_ID)).toHaveLength(2)
    )
    .and('should show the changed revision once', (_, testStore) =>
      expect(getView(testStore)).toEqual([
        { id: '_:a-00001', position: 1_000, text: ['A quick'] },
        { id: '_:a-00002', position: 2_000, text: ['a-00002:CHANGED'] }
      ])
    );
});

scenario('re-sending a middle revision of an ongoing livestream session', bdd => {
  const message1 = buildMessage({
    id: 'a-00001',
    livestream: { final: false, sequenceNumber: 1, sessionId: 'a-00001' },
    logicalTimestamp: 1_000,
    text: 'A quick'
  });

  const message2 = buildMessage({
    id: 'a-00002',
    livestream: { final: false, sequenceNumber: 2, sessionId: 'a-00001' },
    logicalTimestamp: 2_000,
    text: 'A quick brown fox'
  });

  const message3 = buildMessage({
    id: 'a-00003',
    livestream: { final: false, sequenceNumber: 3, sessionId: 'a-00001' },
    logicalTimestamp: 3_000,
    text: 'A quick brown fox jumped'
  });

  // Same ID as the middle revision with a changed text, e.g. delivered again after a reconnect.
  const message2Changed = buildMessage({
    id: 'a-00002',
    livestream: { final: false, sequenceNumber: 2, sessionId: 'a-00001' },
    logicalTimestamp: 2_000,
    text: 'a-00002:CHANGED'
  });

  bdd
    .given('an ongoing livestream session with 3 revisions', () => createSortedTestStore(message1, message2, message3))
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
});

// New: pins core's `upsert.ts:280-292` (no unit test in core; html2 `livestream/concludedLivestream.html`).
scenario('upserting a revision after the session is finalized', bdd => {
  bdd
    .given('a finalized livestream session', () =>
      createSortedTestStore(
        buildMessage({
          id: 'a-00001',
          livestream: { final: false, sequenceNumber: 1, sessionId: 'a-00001' },
          logicalTimestamp: 1_000,
          text: 'A quick'
        }),
        buildMessage({
          id: 'a-00002',
          livestream: { final: true, sessionId: 'a-00001' },
          logicalTimestamp: 2_000,
          text: 'A quick brown fox.'
        })
      )
    )
    .when('a late revision is upserted', testStore =>
      upsertEach(
        testStore,
        buildMessage({
          id: 'a-00003',
          livestream: { final: false, sequenceNumber: 2, sessionId: 'a-00001' },
          logicalTimestamp: 1_500,
          text: 'A quick brown'
        })
      )
    )
    .then('should drop the late revision', (_, { store }) => expect(store.getSnapshot().has('_:a-00003')).toBe(false))
    .and('should still show the final revision', (_, testStore) =>
      expect(getView(testStore).map(({ id }) => id)).toEqual(['_:a-00002'])
    );
});
