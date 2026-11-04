import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import createReadonlySet from './createReadonlySet.ts';
import getPartIds, { partIdsSymbol, type PartIds } from './getPartIds.ts';
import { sortedChildIdsSymbol } from './sortedChildIds.ts';
import type VersionedSkipList from './VersionedSkipList.ts';

/**
 * Returns a copy of the node with `hasPart` generated from the IDs of its children, and IDs of its children sorted by
 * `dateCreated` for `Store.getSortedChildren()`.
 *
 * - `hasPart` is an enumerable getter, it will appear in spread, `Object.entries()`, and `JSON.stringify()`
 * - `hasPart` is generated on first access and cached, as `childIds` must be immutable
 * - If `childIds` is empty, the node will not have `hasPart`
 *
 * The node must be created by `createNode()` or this function. Other properties are copied as-is without validation.
 * This is O(number of properties), regardless of the number of children.
 */
function attachHasPart(
  node: Node,
  childIds: ReadonlySet<Identifier>,
  sortedChildIds: VersionedSkipList<Identifier> | undefined
): Node {
  const nextNode = {};

  // Do not use `Object.entries()`, it will invoke the `hasPart` getter and generate it.
  for (const key of Object.keys(node)) {
    key === 'hasPart' || Object.defineProperty(nextNode, key, { enumerable: true, value: Reflect.get(node, key) });
  }

  if (childIds.size) {
    let hasPart: ReadonlySet<NodeReference> | undefined;

    Object.defineProperty(nextNode, 'hasPart', {
      enumerable: true,
      get: () => (hasPart ??= createReadonlySet(Array.from(childIds, id => Object.freeze({ '@id': id }))))
    });
  }

  return Object.freeze(
    Object.defineProperties(nextNode, {
      [partIdsSymbol]: {
        value: Object.freeze({ hasPart: childIds, isPartOf: getPartIds(node, 'isPartOf') } satisfies PartIds)
      },
      [sortedChildIdsSymbol]: { value: sortedChildIds }
    })
  ) satisfies object as Node;
}

export default attachHasPart;
