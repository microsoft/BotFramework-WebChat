import { parse } from 'valibot';
import { nodeSchema, type Node } from '../node/Node.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import createReadonlySet, { isReadonlySet } from './createReadonlySet.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import getPartIds, { buildPartIds, partIdsSymbol, type PartIds } from './getPartIds.ts';

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

/**
 * Validates the value and creates an immutable node for storing in the graph.
 *
 * - The node is validated against the node schema
 * - The node is deeply frozen
 * - IDs of nodes in `hasPart` and `isPartOf` are cached in a hidden (non-enumerable) property for `getPartIds()`
 *
 * All nodes stored in the graph must be created by this function.
 */
function createNode(value: unknown): Node {
  // Property values are deeply frozen, the node itself is frozen after part IDs are attached.
  const node: Node = Object.fromEntries(
    Object.entries(parse(nodeSchema, value)).map(([key, value]) => [key, deepFreeze(value)])
  ) satisfies object as Node;

  // The cache is built up front because the node is frozen and cannot be modified later.
  // As nodes are immutable, the cache never goes stale. A copy of the node (e.g. via spread) will not carry the cache.
  // Not enumerable: hidden from spread, `Object.entries()`, `JSON.stringify()`, and deep equality checks.
  return Object.freeze(
    Object.defineProperty(node, partIdsSymbol, {
      value: Object.freeze({
        hasPart: buildPartIds(node, 'hasPart'),
        isPartOf: buildPartIds(node, 'isPartOf')
      } satisfies PartIds)
    })
  );
}

/**
 * Builds a read-only `Set` of frozen node references, reusing existing references for unchanged IDs.
 *
 * @returns `undefined` if there are no IDs.
 */
function buildPartReferences(
  prevReferences: Node['hasPart'],
  ids: ReadonlySet<Identifier>
): ReadonlySet<NodeReference> | undefined {
  if (!ids.size) {
    return undefined;
  }

  const prevReferenceMap = new Map(Array.from(prevReferences ?? [], reference => [reference['@id'], reference]));

  return createReadonlySet(Array.from(ids, id => prevReferenceMap.get(id) ?? Object.freeze({ '@id': id })));
}

/**
 * Creates an immutable node from a node already in the graph, with its `hasPart` and/or `isPartOf` replaced.
 *
 * This is a fast path of `createNode()` which skips validation and deep freezing:
 *
 * - Other properties are already validated and frozen, they are copied as-is
 * - Part IDs are trusted, they must come from nodes in the graph (which are validated)
 * - Existing frozen references are reused for unchanged part IDs
 *
 * OPINION: Empty part IDs will remove the property, same as if the property is removed.
 */
function createTrustedNode(
  node: Node,
  nextPartIds: {
    readonly hasPart?: ReadonlySet<Identifier> | undefined;
    readonly isPartOf?: ReadonlySet<Identifier> | undefined;
  }
): Node {
  const hasPart = nextPartIds.hasPart ? buildPartReferences(node.hasPart, nextPartIds.hasPart) : node.hasPart;
  const isPartOf = nextPartIds.isPartOf ? buildPartReferences(node.isPartOf, nextPartIds.isPartOf) : node.isPartOf;

  // Spread then overwrite to keep the order of properties.
  const nextNode: { -readonly [K in keyof Node]: Node[K] } = { ...node, hasPart, isPartOf };

  hasPart || delete nextNode.hasPart;
  isPartOf || delete nextNode.isPartOf;

  // Builds the cache from the new references, the `Set` passed in is not used as the caller may modify it.
  return Object.freeze(
    Object.defineProperty(nextNode, partIdsSymbol, {
      value: Object.freeze({
        hasPart: nextPartIds.hasPart ? buildPartIds({ hasPart }, 'hasPart') : getPartIds(node, 'hasPart'),
        isPartOf: nextPartIds.isPartOf ? buildPartIds({ isPartOf }, 'isPartOf') : getPartIds(node, 'isPartOf')
      } satisfies PartIds)
    })
  ) satisfies object as Node;
}

export default createNode;
export { createTrustedNode };
