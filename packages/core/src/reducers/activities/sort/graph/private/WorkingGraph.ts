import type { GraphIdentifier, GraphNode, GraphTransaction } from '../types';
import { getParentId } from './nodeProperties';
import { forgetSortKeys, hasSameSortKey } from './sortKeys';

/** Parts of each parent, in `position` order. Core's index of the `isPartOf` links (the store has no reverse lookup). */
type PartIndex = ReadonlyMap<GraphIdentifier, readonly GraphIdentifier[]>;

type FlushResult = {
  readonly changedNodes: readonly GraphNode[];
  readonly changedParentIds: readonly GraphIdentifier[];
  readonly partIndex: PartIndex;
  /** The version of each changed node before this transaction (`undefined` for new nodes). */
  readonly previousNodes: ReadonlyMap<GraphIdentifier, GraphNode | undefined>;
  readonly sortedMessageIds: readonly GraphIdentifier[] | undefined;
};

/**
 * A store transaction with pending writes:
 *
 * - every changed node is upserted once, when the transaction is flushed (the store validates each upsert);
 * - parts are read from core's `PartIndex`, so parents do not need a `hasPart` set that grows with the transcript.
 */
class WorkingGraph {
  /**
   * @param snapshot The store's live node map (`store.getSnapshot()`). Reads hit it directly: nothing is upserted
   *                 before `flush()`, so it holds the nodes as of the last transaction.
   */
  constructor(transaction: GraphTransaction, snapshot: ReadonlyMap<string, GraphNode>, partIndex: PartIndex) {
    this.#partIndex = partIndex;
    this.#snapshot = snapshot;
    this.#transaction = transaction;
  }

  #partIndex: PartIndex;
  #pendingNodes = new Map<GraphIdentifier, GraphNode>();
  #pendingParts = new Map<GraphIdentifier, readonly GraphIdentifier[]>();
  #previousNodes = new Map<GraphIdentifier, GraphNode | undefined>();
  #snapshot: ReadonlyMap<string, GraphNode>;
  #sortedMessageIds: readonly GraphIdentifier[] | undefined;
  #transaction: GraphTransaction;

  getNode(id: GraphIdentifier): GraphNode | undefined {
    return this.#pendingNodes.get(id) ?? this.#snapshot.get(id);
  }

  getParts(parentId: GraphIdentifier): readonly GraphIdentifier[] {
    return this.#pendingParts.get(parentId) ?? this.#partIndex.get(parentId) ?? [];
  }

  setNode(node: GraphNode): void {
    const id = node['@id'];
    const currentNode = this.getNode(id);
    const currentParentId = getParentId(currentNode);

    // A part whose sort key changes in place (e.g. a HowTo's timestamp) makes its parent's cached keys stale.
    currentNode &&
      currentParentId &&
      !hasSameSortKey(currentNode, node) &&
      forgetSortKeys(this.getParts(currentParentId));

    this.#previousNodes.has(id) || this.#previousNodes.set(id, this.#snapshot.get(id));
    this.#pendingNodes.set(id, node);
  }

  setParts(parentId: GraphIdentifier, partIds: readonly GraphIdentifier[]): void {
    this.#pendingParts.set(parentId, Object.isFrozen(partIds) ? partIds : Object.freeze(partIds));
  }

  /** The displayed messages after this transaction, if already computed (by `stampActivityPositions()`). */
  setSortedMessageIds(sortedMessageIds: readonly GraphIdentifier[]): void {
    this.#sortedMessageIds = Object.freeze(sortedMessageIds);
  }

  /** Upserts the changed nodes into the store. Returns them as stored, with what `deriveState()` needs. */
  flush(): FlushResult {
    const changedNodes: GraphNode[] = [];

    for (const node of this.#pendingNodes.values()) {
      this.#transaction.upsertNode(node);

      // The store keeps its own (validated) copy.
      changedNodes.push(this.#transaction.getNode(node['@id']) ?? node);
    }

    const partIndex = new Map(this.#partIndex);

    for (const [parentId, partIds] of this.#pendingParts) {
      partIds.length ? partIndex.set(parentId, partIds) : partIndex.delete(parentId);
    }

    return Object.freeze({
      changedNodes: Object.freeze(changedNodes),
      changedParentIds: Object.freeze(Array.from(this.#pendingParts.keys())),
      partIndex: Object.freeze(partIndex),
      previousNodes: this.#previousNodes,
      sortedMessageIds: this.#sortedMessageIds
    });
  }
}

export default WorkingGraph;
export { type FlushResult, type PartIndex };
