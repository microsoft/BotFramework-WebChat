import { parse } from 'valibot';
import { nodeSchema, type Node } from '../node/Node.ts';
import createReadonlySet, { isReadonlySet } from './createReadonlySet.ts';
import { buildPartIds, partIdsSymbol, type PartIds } from './getPartIds.ts';

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

export default createNode;
