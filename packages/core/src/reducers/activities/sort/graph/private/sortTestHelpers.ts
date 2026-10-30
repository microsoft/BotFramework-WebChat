import createActivitiesGraph, { type ActivitiesGraph } from '../createActivitiesGraph';
import getSortedMessages from '../getSortedMessages';
import type { SortFacts } from '../SortFacts';
import type { GraphIdentifier, GraphNode } from '../types';
import upsertSortedMessage from '../upsertSortedMessage';
import getOrderedParts from './getOrderedParts';

const CONVERSATION_ID = '_:conversation';

type TestMessage = { readonly node: GraphNode; readonly sortFacts: SortFacts };
type MessageInit = SortFacts & { readonly id: string; readonly text: string };

/** Builds a message node `_:<id>` and its sort facts, like `toActivityNode()`/`toSortFacts()` do for an activity. */
function buildMessage({ id, text, ...sortFacts }: MessageInit): TestMessage {
  const nodeId: `_:${string}` = `_:${id}`;

  return Object.freeze({
    node: { '@id': nodeId, '@type': new Set(['Message']), text: [text] },
    sortFacts: Object.freeze(sortFacts)
  });
}

/** Upserts each message in its own transaction, in order, like one reducer action per activity. */
function upsertEach(graph: ActivitiesGraph, ...messages: readonly TestMessage[]): ActivitiesGraph {
  for (const { node, sortFacts } of messages) {
    graph.edit(transaction => upsertSortedMessage(transaction, CONVERSATION_ID, node, sortFacts));
  }

  return graph;
}

function createSortedTestStore(...messages: readonly TestMessage[]): ActivitiesGraph {
  return upsertEach(createActivitiesGraph(), ...messages);
}

type ViewEntry = { readonly id: GraphIdentifier; readonly position: number | undefined; readonly text: unknown };

/** The derived view as `{ id, position, text }`, for readable expectations. */
function getView({ store }: ActivitiesGraph): readonly ViewEntry[] {
  const snapshot = store.getSnapshot();

  return getSortedMessages(id => snapshot.get(id), CONVERSATION_ID).map(({ '@id': id, position, text }) =>
    Object.freeze({ id, position, text })
  );
}

/** The parts of a node in `position` order, as IDs. */
function getPartIds({ store }: ActivitiesGraph, parentId: GraphIdentifier): readonly GraphIdentifier[] {
  const snapshot = store.getSnapshot();

  return getOrderedParts(id => snapshot.get(id), parentId).map(node => node['@id']);
}

/**
 * Checks the integrity rules listed in William's `Store.ts` that the sorter is responsible for. Returns the violations.
 *
 * - Every `isPartOf` node is in the graph and lists the part in its `hasPart`
 * - Every `hasPart` node is in the graph and is `isPartOf` the parent
 * - Parts of the same parent have a position, and no 2 parts have the same position
 */
function getIntegrityViolations(snapshot: ReadonlyMap<string, GraphNode>): readonly string[] {
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
  upsertEach,
  type TestMessage
};
