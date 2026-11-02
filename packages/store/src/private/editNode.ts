import { parse } from 'valibot';
import { nodeSchema, type Node } from '../node/Node.ts';
import { nodeReferenceSchema, type NodeReference } from '../node/NodeReference.ts';
import createReadonlySet, { isReadonlySet } from './createReadonlySet.ts';
import getPartIds, { buildPartIds, partIdsSymbol, type PartIds, type PartProperty } from './getPartIds.ts';

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

const PART_PROPERTIES: ReadonlySet<string> = createReadonlySet<PartProperty>(['hasPart', 'isPartOf']);

/**
 * Checks if only `hasPart` and/or `isPartOf` are edited, by comparing other properties by reference.
 */
function isOnlyPartEdited(prevNode: Node, nextNode: object): boolean {
  const prevEntries = Object.entries(prevNode).filter(([key]) => !PART_PROPERTIES.has(key));
  const nextEntries = new Map(Object.entries(nextNode).filter(([key]) => !PART_PROPERTIES.has(key)));

  return (
    prevEntries.length === nextEntries.size &&
    prevEntries.every(([key, value]) => nextEntries.has(key) && nextEntries.get(key) === value) &&
    Array.from(PART_PROPERTIES).every(key => {
      const value: unknown = Object.getOwnPropertyDescriptor(nextNode, key)?.value;

      return typeof value === 'undefined' || value instanceof Set;
    })
  );
}

/**
 * Freezes the node and attaches the hidden part IDs cache.
 */
function sealNode(node: object, partIds: PartIds): Node {
  // The cache is built up front because the node is frozen and cannot be modified later.
  // As nodes are immutable, the cache never goes stale. A copy of the node (e.g. via spread) will not carry the cache.
  // Not enumerable: hidden from spread, `Object.entries()`, `JSON.stringify()`, and deep equality checks.
  return Object.freeze(
    Object.defineProperty(node, partIdsSymbol, { value: Object.freeze(partIds) })
  ) satisfies object as Node;
}

/**
 * Validates the value and creates an immutable node for storing in the graph.
 */
function createNode(value: unknown): Node {
  // Property values are deeply frozen, the node itself is frozen after part IDs are attached.
  const node: Record<string, unknown> & { -readonly [K in PartProperty]?: Node[K] } = Object.fromEntries(
    Object.entries(parse(nodeSchema, value)).map(([key, value]) => [key, deepFreeze(value)])
  );

  // OPINION: Empty property value is same as if the property is removed.
  node.hasPart?.size || delete node.hasPart;
  node.isPartOf?.size || delete node.isPartOf;

  return sealNode(node, { hasPart: buildPartIds(node, 'hasPart'), isPartOf: buildPartIds(node, 'isPartOf') });
}

/**
 * Edits `hasPart` or `isPartOf` of a trusted node.
 *
 * Unchanged references (same object in the previous node) are reused as they are already validated and frozen. Only
 * new references are validated, which is O(number of new references) instead of O(size of the node).
 *
 * @returns `undefined` if there are no references.
 */
function editPartReferences(
  prevReferences: ReadonlySet<NodeReference> | undefined,
  references: ReadonlySet<unknown> | undefined
): ReadonlySet<NodeReference> | undefined {
  if (references === prevReferences) {
    return prevReferences;
  } else if (!references?.size) {
    // OPINION: Empty property value is same as if the property is removed.
    return undefined;
  }

  const prevReferenceMap = new Map<unknown, NodeReference>(
    Array.from(prevReferences ?? [], reference => [reference, reference])
  );

  return createReadonlySet(
    Array.from(
      references,
      reference => prevReferenceMap.get(reference) ?? Object.freeze(parse(nodeReferenceSchema, reference))
    )
  );
}

/**
 * Creates an immutable node for storing in the graph, from the previous node (if any) and the next node.
 *
 * - If the node is new, or any properties other than `hasPart` and `isPartOf` are edited, the node is validated
 *   against the node schema and deeply frozen, this is O(size of the node)
 * - If only `hasPart` and/or `isPartOf` are edited, the previous node is trusted: other properties are copied as-is,
 *   unchanged references are reused, and only new references are validated
 * - If nothing is edited, the previous node is returned
 *
 * IDs of nodes in `hasPart` and `isPartOf` are cached in a hidden (non-enumerable) property for `getPartIds()`.
 *
 * All nodes stored in the graph must be created by this function.
 *
 * @param prevNode The previous node in the graph, must be created by this function. `undefined` if creating a new node.
 * @param nextNode The next node, not trusted.
 */
function editNode(prevNode: Node | undefined, nextNode: unknown): Node {
  if (nextNode === prevNode && prevNode) {
    return prevNode;
  } else if (
    !prevNode ||
    !nextNode ||
    typeof nextNode !== 'object' ||
    Array.isArray(nextNode) ||
    !isOnlyPartEdited(prevNode, nextNode)
  ) {
    return createNode(nextNode);
  }

  const { hasPart, isPartOf }: { hasPart?: ReadonlySet<unknown>; isPartOf?: ReadonlySet<unknown> } = nextNode;
  const nextHasPart = editPartReferences(prevNode.hasPart, hasPart);
  const nextIsPartOf = editPartReferences(prevNode.isPartOf, isPartOf);

  if (nextHasPart === prevNode.hasPart && nextIsPartOf === prevNode.isPartOf) {
    return prevNode;
  }

  // Keeps the order of properties in the next node.
  const node: Record<string, unknown> & { -readonly [K in PartProperty]?: Node[K] } = {
    ...nextNode,
    hasPart: nextHasPart,
    isPartOf: nextIsPartOf
  };

  nextHasPart || delete node.hasPart;
  nextIsPartOf || delete node.isPartOf;

  return sealNode(node, {
    hasPart: nextHasPart === prevNode.hasPart ? getPartIds(prevNode, 'hasPart') : buildPartIds(node, 'hasPart'),
    isPartOf: nextIsPartOf === prevNode.isPartOf ? getPartIds(prevNode, 'isPartOf') : buildPartIds(node, 'isPartOf')
  });
}

export default editNode;
