import { parse } from 'valibot';
import { nodeSchema, type Node } from '../node/Node.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import createReadonlySet, { isReadonlySet } from './createReadonlySet.ts';
import createReadonlyNodeSet from './createReadonlyNodeSet.ts';

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
 * - `hasPart` and `isPartOf` are stored as `ReadonlyNodeSet`, so `getPartIds()` can get the IDs in O(1)
 *
 * All nodes stored in the graph must be created by this function.
 */
function createNode(value: unknown): Node {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(parse(nodeSchema, value)).map(([key, value]) => [
        key,
        (key === 'hasPart' || key === 'isPartOf') && value instanceof Set
          ? createReadonlyNodeSet(Array.from(value, ({ '@id': id }: NodeReference) => id))
          : deepFreeze(value)
      ])
    )
  ) satisfies object as Node;
}

export default createNode;
