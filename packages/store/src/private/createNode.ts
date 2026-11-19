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
 * @param originalValue Value of the own data property before validation, `undefined` for accessor property.
 * @param value Value after validation, validation always returns a new `Set`.
 */
function toFrozenNodeSet(originalValue: unknown, value: ReadonlySet<NodeReference>): FrozenNodeSet {
  const ids = getNodeSetIds(originalValue);

  return ids && isSameIds(ids, value)
    ? (originalValue satisfies unknown as FrozenNodeSet)
    : new FrozenNodeSet(Array.from(value, ({ '@id': id }) => id));
}

/**
 * Gets the value of an own data property without calling getters, as they could have side effects or return a
 * different value on every read. Returns `undefined` for accessor properties, so the validated value is copied.
 *
 * @param target Object before validation, it is an object as it passed validation.
 */
function getOwnDataPropertyValue(target: object, key: string): unknown {
  const descriptor = Reflect.getOwnPropertyDescriptor(target, key);

  return descriptor && 'value' in descriptor ? descriptor.value : undefined;
}

/**
 * Validates the value and creates an unfrozen node, call `freezeNode()` to freeze it for storing in the graph.
 *
 * - The node is validated against the node schema
 * - The node is a plain object, dangerous keys (e.g. `__proto__`) are skipped, see `isDangerousKey()`
 * - Property values are deeply frozen, values which are already deeply immutable are reused as-is, see `deepFreeze()`
 * - The node object itself is not frozen, so it can be modified in place before `freezeNode()` without copying
 * - `hasPart` and `isPartOf` are stored as `FrozenNodeSet`, so `getPartIds()` can get the IDs in O(1)
 * - `dateCreated` is parsed once and cached as a hidden property for sorting, see `getPreciseDateCreatedTime()`
 *
 * All nodes stored in the graph must be created by this function, the returned node is branded as `UnfrozenNode`.
 */
function createNode(value: unknown): UnfrozenNode {
  const safeNode = parse(nodeSchema, value);

  return attachDateCreatedTime(
    Object.fromEntries(
      Object.entries(safeNode)
        .filter(([key]) => !isDangerousKey(key))
        .map(([key, safeValue]) => {
          const safePartValue =
            key === 'hasPart' ? safeNode.hasPart : key === 'isPartOf' ? safeNode.isPartOf : undefined;
          // `value` is an object as it passed validation.
          const originalValue = getOwnDataPropertyValue(value as object, key);

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
