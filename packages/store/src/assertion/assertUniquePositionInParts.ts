import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import getPartIds from '../private/getPartIds.ts';

/**
 * RULE: All members of the same part must have different `position` values, if specified.
 *
 * Only parts which the affected nodes participated in are checked.
 */
function assertUniquePositionInParts(state: ReadonlyMap<string, Node>, affectedNodeIds: ReadonlySet<Identifier>): void {
  const parentIds = new Set<Identifier>();

  for (const id of affectedNodeIds) {
    const node = state.get(id);

    if (node) {
      node.hasPart?.size && parentIds.add(id);

      for (const parentId of getPartIds(node, 'isPartOf')) {
        parentIds.add(parentId);
      }
    }
  }

  for (const parentId of parentIds) {
    const memberIdsByPosition = new Map<number, Identifier>();

    for (const memberId of getPartIds(state.get(parentId), 'hasPart')) {
      const position = state.get(memberId)?.position;

      if (typeof position === 'number') {
        const conflictMemberId = memberIdsByPosition.get(position);

        if (conflictMemberId) {
          throw new Error(
            `Nodes "${conflictMemberId}" and "${memberId}" in part "${parentId}" must not have the same position of ${position}`
          );
        }

        memberIdsByPosition.set(position, memberId);
      }
    }
  }
}

export default assertUniquePositionInParts;
