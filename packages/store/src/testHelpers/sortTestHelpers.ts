import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import getSortedMessages from '../sort/getSortedMessages.ts';
import getOrderedParts from '../sort/private/getOrderedParts.ts';
import type { SortableMessage } from '../sort/SortableMessage.ts';
import upsertSortedMessage from '../sort/upsertSortedMessage.ts';
import createTestStore, { type TestStore } from './createTestStore.ts';

const CONVERSATION_ID = '_:conversation';

type MessageInit = Omit<SortableMessage, 'node'> & { readonly id: string; readonly text: string };

/** Builds the sort input of a message node `_:<id>`, like a source would extract it from an activity. */
function buildMessage({ id, text, ...init }: MessageInit): SortableMessage {
  const nodeId: `_:${string}` = `_:${id}`;

  return Object.freeze({
    ...init,
    node: { '@id': nodeId, '@type': new Set(['Message']), text: [text] }
  });
}

/** Upserts each message in its own transaction, in order, like one reducer action per activity. */
function upsertEach(testStore: TestStore, ...messages: readonly SortableMessage[]): TestStore {
  for (const message of messages) {
    testStore.edit(transaction => upsertSortedMessage(transaction, CONVERSATION_ID, message));
  }

  return testStore;
}

function createSortedTestStore(...messages: readonly SortableMessage[]): TestStore {
  return upsertEach(createTestStore(), ...messages);
}

type ViewEntry = { readonly id: Identifier; readonly position: number | undefined; readonly text: unknown };

/** The derived view as `{ id, position, text }`, for readable expectations. */
function getView({ store }: TestStore): readonly ViewEntry[] {
  return getSortedMessages(store.getSnapshot(), CONVERSATION_ID).map(({ '@id': id, position, text }) =>
    Object.freeze({ id, position, text })
  );
}

/** The parts of a node in `position` order, as IDs. */
function getPartIds({ store }: TestStore, parentId: Identifier): readonly Identifier[] {
  const snapshot = store.getSnapshot();

  return getOrderedParts(id => snapshot.get(id), parentId).map(node => node['@id']);
}

/**
 * Checks the integrity rules listed in `Store.ts` that the sorter is responsible for. Returns the violations.
 *
 * - Every `isPartOf` node is in the graph and lists the part in its `hasPart`
 * - Every `hasPart` node is in the graph and is `isPartOf` the parent
 * - Parts of the same parent have a position, and no 2 parts have the same position
 */
function getIntegrityViolations(snapshot: ReadonlyMap<string, Node>): readonly string[] {
  const violations: string[] = [];

  for (const node of snapshot.values()) {
    const id = node['@id'];

    for (const { '@id': parentId } of node.isPartOf ?? []) {
      const parent = snapshot.get(parentId);

      parent || violations.push(`${id} isPartOf missing ${parentId}`);
      parent &&
        !Array.from(parent.hasPart ?? []).some(({ '@id': partId }) => partId === id) &&
        violations.push(`${parentId} hasPart does not list ${id}`);
    }

    const positions = new Set<number>();

    for (const { '@id': partId } of node.hasPart ?? []) {
      const part = snapshot.get(partId);

      if (!part) {
        violations.push(`${id} hasPart missing ${partId}`);
      } else {
        Array.from(part.isPartOf ?? []).some(({ '@id': parentId }) => parentId === id) ||
          violations.push(`${partId} is not isPartOf ${id}`);

        if (typeof part.position === 'undefined') {
          violations.push(`${partId} has no position in ${id}`);
        } else {
          positions.has(part.position) && violations.push(`${partId} has a conflicting position in ${id}`);
          positions.add(part.position);
        }
      }
    }
  }

  return Object.freeze(violations);
}

export {
  buildMessage,
  CONVERSATION_ID,
  createSortedTestStore,
  getIntegrityViolations,
  getPartIds,
  getView,
  upsertEach
};
