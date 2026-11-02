import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import getPartChanges from '../private/getPartChanges.ts';
import getPartIds from '../private/getPartIds.ts';

/**
 * RULE: `hasPart` and `isPartOf` must be inverse of each other.
 *
 * - If a child has `isPartOf` pointing to a parent, the parent must have `hasPart` pointing to the child
 * - If a parent has `hasPart` pointing to a child, the child must have `isPartOf` pointing to the parent
 *
 * The previous state is assumed to satisfy this rule. Only part relationships added or removed by the affected nodes
 * are checked, as any broken pair must have at least one side changed. This is O(number of changed part relationships)
 * instead of O(number of parts of the affected nodes).
 */
function assertInversePartRelationship(
  prevState: ReadonlyMap<string, Node>,
  nextState: ReadonlyMap<string, Node>,
  affectedNodeIds: ReadonlySet<Identifier>
): void {
  for (const id of affectedNodeIds) {
    for (const { included, property, targetId } of getPartChanges(id, prevState.get(id), nextState.get(id))) {
      const [parentId, childId] = property === 'hasPart' ? [id, targetId] : [targetId, id];
      const targetNode = nextState.get(targetId);
      const inverseProperty = property === 'hasPart' ? 'isPartOf' : 'hasPart';

      // When a relationship is removed, the other side must also remove it, unless the other side is deleted.
      if (
        included ? !getPartIds(targetNode, inverseProperty).has(id) : getPartIds(targetNode, inverseProperty).has(id)
      ) {
        throw new Error(
          inverseProperty === 'hasPart'
            ? `Node "${parentId}" must ${included ? 'have' : 'not have'} "${childId}" in hasPart as it is inverse of isPartOf`
            : `Node "${childId}" must ${included ? 'have' : 'not have'} "${parentId}" in isPartOf as it is inverse of hasPart`
        );
      }
    }
  }
}

export default assertInversePartRelationship;
