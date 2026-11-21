import { parse } from 'valibot';
import { nodeSchema } from '../node/Node.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import FrozenNodeSet, { getNodeSetIds } from '../structure/FrozenNodeSet.ts';
import deepFreeze from './deepFreeze.ts';
import type { DraftNode } from './DraftNode.ts';
import isDangerousKey from './isDangerousKey.ts';

// Passed to validation in place of a `FrozenNodeSet`, it is always created by the store from validated IDs.
const EMPTY_SET: ReadonlySet<never> = Object.freeze(new Set<never>());

function hasToJSON(value: unknown): boolean {
  return !!value && typeof value === 'object' && typeof Reflect.get(value, 'toJSON') === 'function';
}

/**
 * OPINION: `toJSON()` is not supported on nodes, property values, and items in sets (e.g. `hasPart`), except inside
 *          `@value` of JSON literal. `JSON.parse(JSON.stringify(node))` would be different from the node.
 */
function assertNoToJSON(value: unknown, entries: ReadonlyMap<string, unknown>): void {
  const error = (): TypeError =>
    new TypeError('toJSON() is not supported on nodes, property values, and node references, use a plain object');

  if (hasToJSON(value)) {
    throw error();
  }

  for (const entryValue of entries.values()) {
    if (Array.isArray(entryValue) || (entryValue instanceof Set && !getNodeSetIds(entryValue))) {
      for (const item of entryValue) {
        if (hasToJSON(item)) {
          throw error();
        }
      }
    }
  }
}

/**
 * Returns a `FrozenNodeSet` of the node references.
 *
 * - If the original value is a `FrozenNodeSet`, it is immutable and returned as-is, i.e. unchanged parts are reused
 * - Otherwise, IDs are copied from the validated value
 *
 * @param originalValue Value of the property before validation.
 * @param value Value after validation, validation always returns a new `Set`.
 */
function toFrozenNodeSet(originalValue: unknown, value: ReadonlySet<NodeReference>): FrozenNodeSet {
  return getNodeSetIds(originalValue)
    ? (originalValue satisfies unknown as FrozenNodeSet)
    : new FrozenNodeSet(Array.from(value, ({ '@id': id }) => id));
}

/**
 * Validates the value and creates a draft node, which is committed to the graph by `Draft.commit()`.
 *
 * - Like `JSON.stringify()`, only own enumerable string-keyed properties are read, each of them is read once
 *   - Non-enumerable or inherited properties are ignored, thus, required properties (e.g. `@id`) defined this way throw
 * - `toJSON()` on the node, property values, and node references is not supported and throws
 * - The node is validated against the node schema
 *   - `hasPart` and `isPartOf` which are `FrozenNodeSet` (i.e. created by the store) are not validated again, so passing
 *     unchanged parts back is O(1) regardless of the number of parts
 * - The node is a plain object, dangerous keys (e.g. `__proto__`) are skipped, see `isDangerousKey()`
 * - Property values are deeply frozen, values which are already deeply immutable are reused as-is, see `deepFreeze()`
 * - The node object itself is not frozen, so it can be modified in place before `Draft.commit()` without copying
 * - `hasPart` and `isPartOf` are stored as `FrozenNodeSet`, so `getHasPartIds()` and `getIsPartOfIds()` can get the IDs in O(1)
 *
 * All nodes stored in the graph must be created by this function, the returned node is branded as `DraftNode`.
 */
function createDraftNode(value: unknown): DraftNode {
  const originalEntries = value && typeof value === 'object' ? new Map(Object.entries(value)) : undefined;

  originalEntries && assertNoToJSON(value, originalEntries);

  const safeNode = parse(
    nodeSchema,
    originalEntries
      ? Object.fromEntries(
          Array.from(originalEntries, ([key, value]) => [
            key,
            (key === 'hasPart' || key === 'isPartOf') && getNodeSetIds(value) ? EMPTY_SET : value
          ])
        )
      : value
  );

  return Object.fromEntries(
    Object.entries(safeNode)
      .filter(([key]) => !isDangerousKey(key))
      .map(([key, safeValue]) => {
        const safePartValue = key === 'hasPart' ? safeNode.hasPart : key === 'isPartOf' ? safeNode.isPartOf : undefined;
        const originalValue = originalEntries?.get(key);

        return [
          key,
          safePartValue ? toFrozenNodeSet(originalValue, safePartValue) : deepFreeze(originalValue, safeValue)
        ];
      })
  ) satisfies object as DraftNode;
}

export default createDraftNode;
