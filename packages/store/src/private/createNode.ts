import { parse } from 'valibot';
import { nodeSchema } from '../node/Node.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import createReadonlySet, { isReadonlySet } from '../structure/createReadonlySet.ts';
import { attachDateCreatedTime, parseDateCreatedTime } from './dateCreatedTime.ts';
import type { InternalNode } from './InternalNode.ts';
import createReadonlyNodeSet, { getNodeSetIds, type ReadonlyNodeSet } from '../structure/createReadonlyNodeSet.ts';

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
 * Returns a `ReadonlyNodeSet` of the node references.
 *
 * - If the original value is a `ReadonlyNodeSet`, it is immutable and returned as-is, i.e. unchanged parts are reused
 * - Otherwise, IDs are copied via an iterator without creating an intermediate array
 *
 * @param originalValue Value before validation. It is validated, but validation always returns a new `Set`.
 * @param value Value after validation.
 */
function toReadonlyNodeSet(originalValue: unknown, value: ReadonlySet<NodeReference>): ReadonlyNodeSet {
  return getNodeSetIds(originalValue)
    ? (originalValue satisfies unknown as ReadonlyNodeSet)
    : createReadonlyNodeSet(value.values().map(({ '@id': id }) => id));
}

/**
 * Validates the value and creates an immutable node for storing in the graph.
 *
 * - The node is validated against the node schema
 * - The node is deeply frozen
 * - `hasPart` and `isPartOf` are stored as `ReadonlyNodeSet`, so `getPartIds()` can get the IDs in O(1)
 * - `dateCreated` is parsed once and cached as a hidden property for sorting, see `getDateCreatedTime()`
 *
 * All nodes stored in the graph must be created by this function, the returned node is branded as `InternalNode`.
 */
function createNode(value: unknown): InternalNode {
  const safeNode = parse(nodeSchema, value);

  return Object.freeze(
    attachDateCreatedTime(
      Object.fromEntries(
        Object.entries(safeNode).map(([key, safeValue]) => [
          key,
          (key === 'hasPart' || key === 'isPartOf') && safeValue instanceof Set
            ? // `value` is an object as it passed validation.
              toReadonlyNodeSet(Reflect.get(value as object, key), safeValue)
            : deepFreeze(safeValue)
        ])
      ),
      parseDateCreatedTime(safeNode.dateCreated)
    )
  ) satisfies object as InternalNode;
}

export default createNode;
