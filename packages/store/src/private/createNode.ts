import { parse } from 'valibot';
import { nodeSchema } from '../node/Node.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import { attachDateCreatedTime, parseDateCreatedTime } from './dateCreatedTime.ts';
import deepFreeze, { isDangerousKey } from './deepFreeze.ts';
import type { InternalNode } from './InternalNode.ts';
import ReadonlyNodeSet, { getNodeSetIds } from '../structure/ReadonlyNodeSet.ts';

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
    : new ReadonlyNodeSet(value.values().map(({ '@id': id }) => id));
}

/**
 * Validates the value and creates an immutable node for storing in the graph.
 *
 * - The node is validated against the node schema
 * - The node is a plain object, dangerous keys (e.g. `__proto__`) are skipped, see `isDangerousKey()`
 * - The node is deeply frozen, values which are already deeply immutable are reused as-is, see `deepFreeze()`
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
        Object.entries(safeNode)
          .filter(([key]) => !isDangerousKey(key))
          .map(([key, safeValue]) => [
            key,
            (key === 'hasPart' || key === 'isPartOf') && safeValue instanceof Set
              ? // `value` is an object as it passed validation.
                toReadonlyNodeSet(Reflect.get(value as object, key), safeValue)
              : deepFreeze(Reflect.get(value as object, key), safeValue)
          ])
      ),
      parseDateCreatedTime(safeNode.dateCreated)
    )
  ) satisfies object as InternalNode;
}

export default createNode;
