import type { Activity } from '../../types';
import type { GraphIdentifier, GraphNode, GraphTransaction } from '../types';
import { getParentId, withProperties } from './nodeProperties';
import sortParentsFirst from './sortParentsFirst';
import { forgetSortKeys, hasSameSortKey } from './sortKeys';

/**
 * Parts of each parent, in `position` order. Core's ordered index of the `isPartOf` links: the store's `hasPart` is a
 * set, and `getSortedParts()` sorts by `dateCreated` only, outside of a transaction.
 */
type PartIndex = ReadonlyMap<GraphIdentifier, readonly GraphIdentifier[]>;

/**
 * The activity of each message node, as the host sent it (see `State.graphActivities`): the store holds a JSON literal
 * of it, core keeps the host's object.
 */
type ActivityTable = ReadonlyMap<GraphIdentifier, Activity>;

type FlushResult = {
  /** Activities set in this transaction, by node ID (their nodes are in `changedNodeIds`). */
  readonly changedActivities: ActivityTable;
  /** IDs of the nodes core upserted. The stored versions are read from the snapshot after the commit. */
  readonly changedNodeIds: readonly GraphIdentifier[];
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
 * - parts are read from core's ordered `PartIndex`, not from the store's `hasPart` (an unordered set).
 */
class WorkingGraph {
  /**
   * @param snapshot The store's snapshot of the last commit (`store.getSnapshot()`). Reads hit it directly: nothing
   *                 is upserted before `flush()`.
   * @param activities The activities of the message nodes before this transaction.
   */
  constructor(
    transaction: GraphTransaction,
    snapshot: ReadonlyMap<string, GraphNode>,
    partIndex: PartIndex,
    activities: ActivityTable = new Map()
  ) {
    this.#activities = activities;
    this.#partIndex = partIndex;
    this.#snapshot = snapshot;
    this.#transaction = transaction;
  }

  #activities: ActivityTable;
  #partIndex: PartIndex;
  #pendingActivities = new Map<GraphIdentifier, Activity>();
  #pendingNodes = new Map<GraphIdentifier, GraphNode>();
  #pendingParts = new Map<GraphIdentifier, readonly GraphIdentifier[]>();
  #previousNodes = new Map<GraphIdentifier, GraphNode | undefined>();
  #snapshot: ReadonlyMap<string, GraphNode>;
  #sortedMessageIds: readonly GraphIdentifier[] | undefined;
  #transaction: GraphTransaction;

  getNode(id: GraphIdentifier): GraphNode | undefined {
    return this.#pendingNodes.get(id) ?? this.#snapshot.get(id);
  }

  /** The activity of a message node, as the host sent it (with core's `channelData`, without the send status). */
  getActivity(id: GraphIdentifier): Activity | undefined {
    return this.#pendingActivities.get(id) ?? this.#activities.get(id);
  }

  /** Sets the activity of a message node; the caller also sets the node (its JSON literal), see `activityNode.ts`. */
  setActivity(id: GraphIdentifier, activity: Activity): void {
    this.#pendingActivities.set(id, activity);
  }

  getParts(parentId: GraphIdentifier): readonly GraphIdentifier[] {
    return this.#pendingParts.get(parentId) ?? this.#partIndex.get(parentId) ?? [];
  }

  /** IDs of the nodes changed so far in this transaction. */
  getPendingNodeIds(): IterableIterator<GraphIdentifier> {
    return this.#pendingNodes.keys();
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

  /**
   * Upserts the changed nodes into the store. The store derives `hasPart` from `isPartOf` when it commits.
   *
   * The store reads `hasPart` in an upsert as "these are my parts": a stale or missing `hasPart` would add or remove
   * parts (a node read from the snapshot carries the `hasPart` of that commit). So parents are upserted first
   * (`sortParentsFirst()`), and every upsert carries the `hasPart` of the store's current node, which includes the
   * parts changed before it in this transaction.
   */
  flush(): FlushResult {
    for (const node of sortParentsFirst(this.#pendingNodes.values(), id => this.getNode(id))) {
      this.#transaction.upsert(node['@id'], current => withProperties(node, { hasPart: current?.hasPart }));
    }

    const partIndex = new Map(this.#partIndex);

    for (const [parentId, partIds] of this.#pendingParts) {
      partIds.length ? partIndex.set(parentId, partIds) : partIndex.delete(parentId);
    }

    return Object.freeze({
      changedActivities: this.#pendingActivities,
      changedNodeIds: Object.freeze(Array.from(this.#pendingNodes.keys())),
      changedParentIds: Object.freeze(Array.from(this.#pendingParts.keys())),
      partIndex: Object.freeze(partIndex),
      previousNodes: this.#previousNodes,
      sortedMessageIds: this.#sortedMessageIds
    });
  }
}

export default WorkingGraph;
export { type ActivityTable, type FlushResult, type PartIndex };
