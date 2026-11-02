import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import createReadonlySet from './createReadonlySet.ts';

type PartProperty = 'hasPart' | 'isPartOf';

type PartIds = {
  readonly hasPart: ReadonlySet<Identifier>;
  readonly isPartOf: ReadonlySet<Identifier>;
};

const EMPTY_PART_IDS: ReadonlySet<Identifier> = createReadonlySet<Identifier>([]);

// Hidden property on the node to cache the IDs in the `hasPart` and `isPartOf` property.
const partIdsSymbol = Symbol('partIds');

type NodeWithPartIds = Node & { readonly [partIdsSymbol]?: PartIds | undefined };

/**
 * Builds a read-only `Set` of IDs of nodes in the `hasPart` or `isPartOf` property. This is O(k).
 */
function buildPartIds(node: Pick<Node, PartProperty>, property: PartProperty): ReadonlySet<Identifier> {
  const references = property === 'hasPart' ? node.hasPart : node.isPartOf;

  return references?.size ? createReadonlySet(Array.from(references, ({ '@id': id }) => id)) : EMPTY_PART_IDS;
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
export { buildPartIds, partIdsSymbol };
export type { PartIds, PartProperty };
