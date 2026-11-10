import { parse } from 'valibot';
import { nodeSchema } from '../node/Node.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import { attachDateCreatedTime, parseDateCreatedTime } from './dateCreatedTime.ts';
import deepFreeze, { isDangerousKey } from './deepFreeze.ts';
import FrozenNodeSet, { getNodeSetIds } from '../structure/FrozenNodeSet.ts';
import type { UnfrozenNode } from './UnfrozenNode.ts';

/**
 * Returns a `FrozenNodeSet` of the node references.
 *
 * - If the original value is a `FrozenNodeSet`, it is immutable and returned as-is, i.e. unchanged parts are reused
 * - Otherwise, IDs are copied via an iterator without creating an intermediate array
 *
 * @param originalValue Value before validation. It is validated, but validation always returns a new `Set`.
 * @param value Value after validation.
 */
function toFrozenNodeSet(originalValue: unknown, value: ReadonlySet<NodeReference>): FrozenNodeSet {
  return getNodeSetIds(originalValue)
    ? (originalValue satisfies unknown as FrozenNodeSet)
    : new FrozenNodeSet(value.values().map(({ '@id': id }) => id));
}

/**
 * Validates the value and creates an unfrozen node, call `freezeNode()` to freeze it for storing in the graph.
 *
 * - The node is validated against the node schema
 * - The node is a plain object, dangerous keys (e.g. `__proto__`) are skipped, see `isDangerousKey()`
 * - Property values are deeply frozen, values which are already deeply immutable are reused as-is, see `deepFreeze()`
 * - The node object itself is not frozen, so it can be modified in place before `freezeNode()` without copying
 * - `hasPart` and `isPartOf` are stored as `FrozenNodeSet`, so `getPartIds()` can get the IDs in O(1)
 * - `dateCreated` is parsed once and cached as a hidden property for sorting, see `getDateCreatedTime()`
 *
 * All nodes stored in the graph must be created by this function, the returned node is branded as `UnfrozenNode`.
 */
function createNode(value: unknown): UnfrozenNode {
  const safeNode = parse(nodeSchema, value);

  return attachDateCreatedTime(
    Object.fromEntries(
      Object.entries(safeNode)
        .filter(([key]) => !isDangerousKey(key))
        .map(([key, safeValue]) => [
          key,
          (key === 'hasPart' || key === 'isPartOf') && safeValue instanceof Set
            ? // `value` is an object as it passed validation.
              toFrozenNodeSet(Reflect.get(value as object, key), safeValue)
            : deepFreeze(Reflect.get(value as object, key), safeValue)
        ])
    ),
    parseDateCreatedTime(safeNode.dateCreated)
  ) satisfies object as UnfrozenNode;
}

export default createNode;
