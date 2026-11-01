import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import getPartIds from '../private/getPartIds.ts';

/**
 * RULE: `hasPart` and `isPartOf` must be inverse of each other.
 *
 * Only part relationships from or to the affected nodes are checked.
 */
function assertInversePartRelationship(
  state: ReadonlyMap<string, Node>,
  backwardReferenceIds: ReadonlyMap<string, ReadonlySet<Identifier>>,
  affectedNodeIds: ReadonlySet<Identifier>
): void {
  for (const id of affectedNodeIds) {
    const node = state.get(id);

    if (node) {
      // Relationships from the affected node, and relationships from other nodes to the affected node.
      const relationships: [Identifier, Identifier][] = [
        ...Array.from(getPartIds(node, 'hasPart'), (childId): [Identifier, Identifier] => [id, childId]),
        ...Array.from(getPartIds(node, 'isPartOf'), (parentId): [Identifier, Identifier] => [parentId, id]),
        ...Array.from(backwardReferenceIds.get(id) ?? []).flatMap(referencingId => {
          const referencingNode = state.get(referencingId);
          const partRelationships: [Identifier, Identifier][] = [];

          getPartIds(referencingNode, 'hasPart').has(id) && partRelationships.push([referencingId, id]);
          getPartIds(referencingNode, 'isPartOf').has(id) && partRelationships.push([id, referencingId]);

          return partRelationships;
        })
      ];

      for (const [parentId, childId] of relationships) {
        if (!getPartIds(state.get(parentId), 'hasPart').has(childId)) {
          throw new Error(`Node "${parentId}" must have "${childId}" in hasPart as it is inverse of isPartOf`);
        } else if (!getPartIds(state.get(childId), 'isPartOf').has(parentId)) {
          throw new Error(`Node "${childId}" must have "${parentId}" in isPartOf as it is inverse of hasPart`);
        }
      }
    }
  }
}

export default assertInversePartRelationship;
