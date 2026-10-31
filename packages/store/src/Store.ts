import { is, parse } from 'valibot';
import { nodeSchema, type Node } from './node/Node.ts';
import { identifierSchema, type Identifier } from './node/NodeIdentifier.ts';
import { nodeReferenceSchema } from './node/NodeReference.ts';
import createReadonlySet, { isReadonlySet } from './private/createReadonlySet.ts';

interface StoreSource {
  start(controller: StoreController): void;
}

interface StoreController {
  edit(transactor: (transaction: StoreTransaction) => void): void;
}

interface StoreTransaction {
  /**
   * Deletes a node and removes all references pointing to the deleted node from other nodes.
   */
  delete(id: Identifier): void;

  /**
   * Inserts or updates a node. The updater will receive the current node (or `undefined` if not exists).
   * The node returned by the updater must have the same `@id` as the `id` argument.
   */
  upsert(id: Identifier, updater: (node: Node | undefined) => Node): void;
}

/**
 * Returns a deeply immutable copy of the value. Arrays and objects are frozen, and `Set` is replaced by a readonly `Set`.
 *
 * Note: `Object.freeze()` does not prevent `Set.prototype.add()` and `Set.prototype.delete()` from modifying the set.
 */
function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || isReadonlySet(value)) {
    return value;
  } else if (value instanceof Set) {
    return createReadonlySet(Array.from(value, deepFreeze)) satisfies ReadonlySet<unknown> as T;
  } else if (Array.isArray(value)) {
    return Object.freeze(value.map(deepFreeze)) satisfies readonly unknown[] as T;
  }

  return Object.freeze(
    Object.fromEntries(Object.entries(value).map(([key, value]) => [key, deepFreeze(value)]))
  ) satisfies object as T;
}

function isReferenceTo(id: Identifier, value: unknown): boolean {
  return is(nodeReferenceSchema, value) && value['@id'] === id;
}

/**
 * Gets IDs of all nodes referenced by the specified node.
 */
function getReferenceIds(node: Node): Set<Identifier> {
  const referenceIds = new Set<Identifier>();

  for (const [key, value] of Object.entries(node)) {
    if (key !== '@context' && key !== '@id' && key !== '@type' && (value instanceof Set || Array.isArray(value))) {
      for (const item of value) {
        is(nodeReferenceSchema, item) && referenceIds.add(item['@id']);
      }
    }
  }

  return referenceIds;
}

/**
 * Updates forward and backward reference maps with the new set of reference IDs of a node.
 */
function setReferenceIds(
  forwardReferenceIds: Map<Identifier, Set<Identifier>>,
  backwardReferenceIds: Map<Identifier, Set<Identifier>>,
  id: Identifier,
  nextReferenceIds: Set<Identifier>
): void {
  for (const referenceId of forwardReferenceIds.get(id) ?? []) {
    const referencingIds = backwardReferenceIds.get(referenceId);

    if (referencingIds) {
      referencingIds.delete(id);
      referencingIds.size || backwardReferenceIds.delete(referenceId);
    }
  }

  nextReferenceIds.size ? forwardReferenceIds.set(id, nextReferenceIds) : forwardReferenceIds.delete(id);

  for (const referenceId of nextReferenceIds) {
    const referencingIds = backwardReferenceIds.get(referenceId);

    referencingIds ? referencingIds.add(id) : backwardReferenceIds.set(referenceId, new Set([id]));
  }
}

function cloneReferenceIds(referenceIds: Map<Identifier, Set<Identifier>>): Map<Identifier, Set<Identifier>> {
  return new Map(Array.from(referenceIds, ([id, ids]) => [id, new Set(ids)]));
}

/**
 * Removes all references to the specified node ID.
 *
 * @returns A new node if references are removed, otherwise, `undefined`.
 */
function removeReference(node: Node, id: Identifier): Node | undefined {
  let changed = false;
  const nextEntries: [string, unknown][] = [];

  for (const [key, value] of Object.entries(node)) {
    if (key === '@context' || key === '@id' || key === '@type') {
      nextEntries.push([key, value]);
    } else if (value instanceof Set || Array.isArray(value)) {
      const values: readonly unknown[] = Array.from(value);
      const nextValues = values.filter(value => !isReferenceTo(id, value));

      if (nextValues.length === values.length) {
        nextEntries.push([key, value]);
      } else {
        changed = true;

        // OPINION: Empty property value is same as if the property is removed.
        nextValues.length && nextEntries.push([key, value instanceof Set ? new Set(nextValues) : nextValues]);
      }
    } else {
      nextEntries.push([key, value]);
    }
  }

  return changed ? deepFreeze(parse(nodeSchema, Object.fromEntries(nextEntries))) : undefined;
}

type PartProperty = 'hasPart' | 'isPartOf';

/**
 * Gets IDs of nodes in the `hasPart` or `isPartOf` property.
 */
function getPartIds(node: Node | undefined, property: PartProperty): Set<Identifier> {
  return new Set(Array.from((property === 'hasPart' ? node?.hasPart : node?.isPartOf) ?? [], ({ '@id': id }) => id));
}

/**
 * Adds or removes a node reference in the `hasPart` or `isPartOf` property.
 *
 * @returns A new node if the property is changed, otherwise, `undefined`.
 */
function setPartReference(node: Node, property: PartProperty, id: Identifier, included: boolean): Node | undefined {
  const partIds = getPartIds(node, property);

  if (partIds.has(id) === included) {
    return undefined;
  }

  included ? partIds.add(id) : partIds.delete(id);

  const nodeWithoutProperty = Object.fromEntries(Object.entries(node).filter(([key]) => key !== property));

  return deepFreeze(
    parse(
      nodeSchema,
      // OPINION: Empty property value is same as if the property is removed.
      partIds.size
        ? { ...nodeWithoutProperty, [property]: new Set(Array.from(partIds, id => ({ '@id': id }))) }
        : nodeWithoutProperty
    )
  );
}

type PartChange = {
  readonly id: Identifier;
  readonly included: boolean;
  readonly property: PartProperty;
  readonly targetId: Identifier;
};

/**
 * Gets part relationships added or removed by comparing the previous node and the next node.
 */
function getPartChanges(prevNode: Node | undefined, node: Node): PartChange[] {
  const id = node['@id'];
  const partChanges: PartChange[] = [];

  for (const property of ['hasPart', 'isPartOf'] as const) {
    const partIds = getPartIds(node, property);
    const prevPartIds = getPartIds(prevNode, property);

    for (const targetId of prevPartIds) {
      partIds.has(targetId) || partChanges.push({ id, included: false, property, targetId });
    }

    for (const targetId of partIds) {
      prevPartIds.has(targetId) || partChanges.push({ id, included: true, property, targetId });
    }
  }

  return partChanges;
}

/**
 * Auto-fixes part membership: `hasPart` and `isPartOf` are inverse of each other.
 *
 * Compares the committed node with the node in this transaction to find out which part relationships are added or
 * removed, then applies them to the other side. On conflict, addition wins over removal.
 *
 * Deleted nodes are skipped as `delete()` already removed all references to them.
 */
function fixPartMembership(
  prevState: ReadonlyMap<string, Node>,
  nextState: ReadonlyMap<string, Node>,
  affectedNodeIds: ReadonlySet<Identifier>,
  setNode: (node: Node) => void
): void {
  const partChanges = Array.from(affectedNodeIds).flatMap(id => {
    const node = nextState.get(id);

    return node ? getPartChanges(prevState.get(id), node) : [];
  });

  // Apply removals before additions, so addition wins on conflict.
  for (const { id, included, property, targetId } of partChanges.sort(
    (x, y) => Number(x.included) - Number(y.included)
  )) {
    const node = nextState.get(id);
    const targetNode = nextState.get(targetId);

    // Apply to both sides as conflicting changes on the other side may have been applied.
    // Target node could be missing, it will be caught by the reference check.
    const nextNode = node && setPartReference(node, property, targetId, included);
    const nextTargetNode =
      targetNode && setPartReference(targetNode, property === 'hasPart' ? 'isPartOf' : 'hasPart', id, included);

    nextNode && setNode(nextNode);
    nextTargetNode && setNode(nextTargetNode);
  }
}

/**
 * RULE: All members of the same part must have different `position` values, if specified.
 *
 * Only parts which the affected nodes participated in are checked.
 */
function assertUniquePositionInParts(state: ReadonlyMap<string, Node>, affectedNodeIds: ReadonlySet<Identifier>): void {
  const parentIds = new Set<Identifier>();

  for (const id of affectedNodeIds) {
    const node = state.get(id);

    if (node) {
      node.hasPart?.size && parentIds.add(id);

      for (const parentId of getPartIds(node, 'isPartOf')) {
        parentIds.add(parentId);
      }
    }
  }

  for (const parentId of parentIds) {
    const memberIdsByPosition = new Map<number, Identifier>();

    for (const memberId of getPartIds(state.get(parentId), 'hasPart')) {
      const position = state.get(memberId)?.position;

      if (typeof position === 'number') {
        const conflictMemberId = memberIdsByPosition.get(position);

        if (conflictMemberId) {
          throw new Error(
            `Nodes "${conflictMemberId}" and "${memberId}" in part "${parentId}" must not have the same position of ${position}`
          );
        }

        memberIdsByPosition.set(position, memberId);
      }
    }
  }
}

class Store {
  constructor(source: StoreSource) {
    const controller: StoreController = {
      // Multiple nodes can be added at once and they could cross reference each other.
      // We need to add all of the nodes at once, auto-fix relationships, and verify the graph integrity.
      edit: transactor => {
        const affectedNodeIds = new Set<Identifier>();

        // All edits are done on a copy. If the transactor throws, the copy is discarded and the state is not changed.
        const nextState = new Map(this.#state);
        const nextBackwardReferenceIds = cloneReferenceIds(this.#backwardReferenceIds);
        const nextForwardReferenceIds = cloneReferenceIds(this.#forwardReferenceIds);

        const setNode = (node: Node): void => {
          const id = node['@id'];

          nextState.set(id, node);
          setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, id, getReferenceIds(node));
          affectedNodeIds.add(id);
        };

        transactor(
          Object.freeze({
            delete: (id: Identifier): void => {
              const safeId = parse(identifierSchema, id);

              nextState.delete(safeId) && affectedNodeIds.add(safeId);

              setReferenceIds(nextForwardReferenceIds, nextBackwardReferenceIds, safeId, new Set());

              // Copy before iterating as the set will be modified while removing references.
              for (const nodeId of Array.from(nextBackwardReferenceIds.get(safeId) ?? [])) {
                const node = nextState.get(nodeId);
                const nextNode = node && removeReference(node, safeId);

                nextNode && setNode(nextNode);
              }
            },
            upsert: (id: Identifier, updater: (node: Node | undefined) => Node): void => {
              const safeId = parse(identifierSchema, id);

              if (typeof updater !== 'function') {
                throw new TypeError('updater must be a function');
              }

              const safeNode = deepFreeze(parse(nodeSchema, updater(nextState.get(safeId))));

              if (safeNode['@id'] !== safeId) {
                throw new Error(`Node returned from updater must have @id of "${safeId}", cannot change @id`);
              }

              // RULE: A node must not be part of itself.
              if (getPartIds(safeNode, 'hasPart').has(safeId) || getPartIds(safeNode, 'isPartOf').has(safeId)) {
                throw new Error(`Node "${safeId}" must not be part of itself`);
              }

              setNode(safeNode);
            }
          })
        );

        if (affectedNodeIds.size) {
          fixPartMembership(this.#state, nextState, affectedNodeIds, setNode);

          // Upserting nodes which reference each other may take multiple `upsert()` calls.
          // Verify integrity on commit: all referenced nodes must be in the graph.
          // As `delete()` removes references to the deleted node, only references from affected nodes need to be checked.
          for (const nodeId of affectedNodeIds) {
            for (const referenceId of nextForwardReferenceIds.get(nodeId) ?? []) {
              if (!nextState.has(referenceId)) {
                throw new Error(`Node "${nodeId}" references node "${referenceId}" which is not in the graph`);
              }
            }
          }

          assertUniquePositionInParts(nextState, affectedNodeIds);

          // THINK: Upsert/delete called twice with same node ID in the same transaction?

          this.#backwardReferenceIds = nextBackwardReferenceIds;
          this.#forwardReferenceIds = nextForwardReferenceIds;
          this.#state = nextState;

          this.#notifyAll();
        }
      }
    };

    source.start(controller);
  }

  /** Key is the node being referenced, values are IDs of nodes which reference the key node. */
  #backwardReferenceIds: Map<Identifier, Set<Identifier>> = new Map();
  /** Key is the node containing node references, values are IDs of nodes being referenced by the key node. */
  #forwardReferenceIds: Map<Identifier, Set<Identifier>> = new Map();
  #listeners: Set<() => void> = new Set<() => void>();
  #state: Map<string, Node> = new Map();

  #notifyAll() {
    for (const listener of this.#listeners) {
      listener();
    }
  }

  getSnapshot(): Map<string, Node> {
    return this.#state;
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);

    return () => {
      this.#listeners.delete(listener);
    };
  }
}

export default Store;
export type { StoreSource as StoreController, StoreController as StoreTransactor, StoreTransaction };
