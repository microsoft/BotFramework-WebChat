import { parse } from 'valibot';
import { nodeSchema } from '../node/Node.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import { attachDateCreatedTime, parseDateCreatedTime } from './dateCreatedTime.ts';
import deepFreeze, { isDangerousKey } from './deepFreeze.ts';
import FrozenNodeSet, { getNodeSetIds } from '../structure/FrozenNodeSet.ts';
import type { UnfrozenNode } from './UnfrozenNode.ts';

function isSameIds(ids: ReadonlySet<string>, value: ReadonlySet<NodeReference>): boolean {
  if (ids.size !== value.size) {
    return false;
  }

  for (const { '@id': id } of value) {
    if (!ids.has(id)) {
      return false;
    }
  }

  return true;
}

/**
 * Returns a `FrozenNodeSet` of the node references.
 *
 * - If the original value is a `FrozenNodeSet` with the same IDs as the validated value, it is immutable and returned
 *   as-is, i.e. unchanged parts are reused
 * - Otherwise, IDs are copied from the validated value
 *
 * @param originalValue Value of the property before validation.
 * @param value Value after validation, validation always returns a new `Set`.
 */
function toFrozenNodeSet(originalValue: unknown, value: ReadonlySet<NodeReference>): FrozenNodeSet {
  const ids = getNodeSetIds(originalValue);

  return ids && isSameIds(ids, value)
    ? (originalValue satisfies unknown as FrozenNodeSet)
    : new FrozenNodeSet(Array.from(value, ({ '@id': id }) => id));
}

/**
 * Validates the value and creates an unfrozen node, call `freezeNode()` to freeze it for storing in the graph.
 *
 * - Like `JSON.stringify()`, only own enumerable string-keyed properties are read, each of them is read once
 *   - Non-enumerable or inherited properties are ignored, thus, required properties (e.g. `@id`) defined this way throw
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
  const originalEntries = value && typeof value === 'object' ? new Map(Object.entries(value)) : undefined;
  const safeNode = parse(nodeSchema, originalEntries ? Object.fromEntries(originalEntries) : value);

  return attachDateCreatedTime(
    Object.fromEntries(
      Object.entries(safeNode)
        .filter(([key]) => !isDangerousKey(key))
        .map(([key, safeValue]) => {
          const safePartValue =
            key === 'hasPart' ? safeNode.hasPart : key === 'isPartOf' ? safeNode.isPartOf : undefined;
          const originalValue = originalEntries?.get(key);

          return [
            key,
            safePartValue ? toFrozenNodeSet(originalValue, safePartValue) : deepFreeze(originalValue, safeValue)
          ];
        })
    ),
    parseDateCreatedTime(safeNode.dateCreated)
  ) satisfies object as UnfrozenNode;
}

export default createNode;
