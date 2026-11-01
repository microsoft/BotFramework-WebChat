import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';

type PartProperty = 'hasPart' | 'isPartOf';

/**
 * Gets IDs of nodes in the `hasPart` or `isPartOf` property.
 */
function getPartIds(node: Node | undefined, property: PartProperty): Set<Identifier> {
  return new Set(Array.from((property === 'hasPart' ? node?.hasPart : node?.isPartOf) ?? [], ({ '@id': id }) => id));
}

export default getPartIds;
export type { PartProperty };
