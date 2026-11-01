import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import createReadonlySet from './createReadonlySet.ts';

type PartProperty = 'hasPart' | 'isPartOf';

const EMPTY_PART_IDS: ReadonlySet<Identifier> = createReadonlySet<Identifier>([]);

// Hidden property on the node to cache the IDs in the `hasPart` and `isPartOf` property.
const partIdsSymbol = Symbol('partIds');

type PartIds = {
  readonly hasPart: ReadonlySet<Identifier>;
  readonly isPartOf: ReadonlySet<Identifier>;
};

type NodeWithPartIds = Node & { readonly [partIdsSymbol]?: PartIds | undefined };

/**
 * Builds a read-only `Set` of IDs of nodes in the `hasPart` or `isPartOf` property. This is O(k).
 */
function buildPartIds(node: Node, property: PartProperty): ReadonlySet<Identifier> {
  const references = property === 'hasPart' ? node.hasPart : node.isPartOf;

  return references?.size ? createReadonlySet(Array.from(references, ({ '@id': id }) => id)) : EMPTY_PART_IDS;
}

/**
 * Returns a frozen copy of a deeply frozen node, with part IDs cached in a hidden (non-enumerable) property.
 *
 * The cache is built up front because the node is frozen and cannot be modified later. As nodes are immutable, the
 * cache never goes stale. A node without the cache (e.g. copied via spread) must be passed to this function again.
 */
function attachPartIds(node: Node): Node {
  return Object.freeze(
    Object.defineProperties(
      { ...node },
      {
        // Not enumerable: hidden from spread, `Object.entries()`, `JSON.stringify()`, and deep equality checks.
        [partIdsSymbol]: {
          value: Object.freeze({
            hasPart: buildPartIds(node, 'hasPart'),
            isPartOf: buildPartIds(node, 'isPartOf')
          } satisfies PartIds)
        }
      }
    )
  );
}

/**
 * Gets IDs of nodes in the `hasPart` or `isPartOf` property.
 *
 * Returns the cached IDs in O(1) if the node is created by `createNode()`, otherwise, builds it in O(k).
 */
function getPartIds(node: NodeWithPartIds | undefined, property: PartProperty): ReadonlySet<Identifier> {
  if (!node) {
    return EMPTY_PART_IDS;
  }

  // eslint-disable-next-line security/detect-object-injection
  const partIds = node[partIdsSymbol];

  return partIds ? (property === 'hasPart' ? partIds.hasPart : partIds.isPartOf) : buildPartIds(node, property);
}

export default getPartIds;
export { attachPartIds };
export type { PartProperty };
