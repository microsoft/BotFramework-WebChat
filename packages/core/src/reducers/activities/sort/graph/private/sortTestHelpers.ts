import createActivitiesGraph, { type ActivitiesGraph } from '../createActivitiesGraph';
import getSortedMessages from '../getSortedMessages';
import type { SortFacts } from '../SortFacts';
import type { GraphIdentifier, GraphNode } from '../types';
import upsertSortedMessage from '../upsertSortedMessage';
import { getParentId } from './nodeProperties';
import WorkingGraph, { type PartIndex } from './WorkingGraph';

const CONVERSATION_ID = '_:conversation';

type TestMessage = { readonly node: GraphNode; readonly sortFacts: SortFacts };
type MessageInit = SortFacts & { readonly id: string; readonly text: string };

/** A graph and its part index, as `State` keeps them. */
type TestGraph = { readonly graph: ActivitiesGraph; partIndex: PartIndex; readonly store: ActivitiesGraph['store'] };

/** Builds a message node `_:<id>` and its sort facts, like `toActivityNode()`/`toSortFacts()` do for an activity. */
function buildMessage({ id, text, ...sortFacts }: MessageInit): TestMessage {
  const nodeId: `_:${string}` = `_:${id}`;

  return Object.freeze({
    node: { '@id': nodeId, '@type': new Set(['Message']), text: [text] },
    sortFacts: Object.freeze(sortFacts)
  });
}

function groupPartsByParent(
  snapshot: ReadonlyMap<string, GraphNode>
): ReadonlyMap<GraphIdentifier, readonly GraphNode[]> {
  const partsByParent = new Map<GraphIdentifier, GraphNode[]>();

  for (const node of snapshot.values()) {
    const parentId = getParentId(node);

    parentId && partsByParent.set(parentId, [...(partsByParent.get(parentId) ?? []), node]);
  }

  return partsByParent;
}

/** The part index lists exactly the parts of each parent (by `isPartOf`), in `position` order. */
function getPartIndexViolations({ partIndex, store }: TestGraph): readonly string[] {
  const partsByParent = groupPartsByParent(store.getSnapshot());
  const violations: string[] = [];

  for (const [parentId, parts] of partsByParent) {
    const expected = [...parts].sort(({ position: x = 0 }, { position: y = 0 }) => x - y).map(node => node['@id']);

    expected.join() === (partIndex.get(parentId) ?? []).join() ||
      violations.push(`part index of ${parentId} is out of sync`);
  }

  for (const parentId of partIndex.keys()) {
    partsByParent.has(parentId) || violations.push(`part index has ${parentId} without parts`);
  }

  return violations;
}

/** Upserts each message in its own transaction, in order, like one reducer action per activity. */
function upsertEach(testGraph: TestGraph, ...messages: readonly TestMessage[]): TestGraph {
  for (const { node, sortFacts } of messages) {
    testGraph.graph.edit(transaction => {
      const working = new WorkingGraph(transaction, testGraph.store.getSnapshot(), testGraph.partIndex);

      if (upsertSortedMessage(working, CONVERSATION_ID, node, sortFacts)) {
        testGraph.partIndex = working.flush().partIndex;
      }
    });

    // Every step keeps core's part index in sync with the `isPartOf` links in the store.
    const outOfSync = getPartIndexViolations(testGraph);

    if (outOfSync.length) {
      throw new Error(outOfSync.join('\n'));
    }
  }

  return testGraph;
}

function createSortedTestStore(...messages: readonly TestMessage[]): TestGraph {
  const graph = createActivitiesGraph();

  return upsertEach({ graph, partIndex: new Map(), store: graph.store }, ...messages);
}

type ViewEntry = { readonly id: GraphIdentifier; readonly position: number | undefined; readonly text: unknown };

/** The derived view as `{ id, position, text }`, for readable expectations. */
function getView({ partIndex, store }: TestGraph): readonly ViewEntry[] {
  const snapshot = store.getSnapshot();

  return getSortedMessages(
    id => snapshot.get(id),
    id => partIndex.get(id) ?? [],
    CONVERSATION_ID
  ).map(({ '@id': id, position, text }) => Object.freeze({ id, position, text }));
}

/** The parts of a node in `position` order, as IDs. */
function getPartIds({ partIndex }: TestGraph, parentId: GraphIdentifier): readonly GraphIdentifier[] {
  return partIndex.get(parentId) ?? [];
}

/**
 * Checks the integrity rules listed in William's `Store.ts` that the sorter is responsible for. Returns the violations.
 *
 * - Every `isPartOf` node is in the graph
 * - Parts of the same parent have a position, and no 2 parts have the same position
 */
function getIntegrityViolations(snapshot: ReadonlyMap<string, GraphNode>): readonly string[] {
  const violations: string[] = [];

  for (const [parentId, parts] of groupPartsByParent(snapshot)) {
    snapshot.has(parentId) || violations.push(`isPartOf missing ${parentId}`);

    const positions = parts.map(({ position }) => position);

    positions.includes(undefined) && violations.push(`a part of ${parentId} has no position`);
    new Set(positions).size === positions.length || violations.push(`conflicting positions in ${parentId}`);
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
  type TestGraph,
  type TestMessage
};
