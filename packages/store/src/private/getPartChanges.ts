import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import getPartIds, { type PartProperty } from './getPartIds.ts';

type PartChange = {
  readonly id: Identifier;
  readonly included: boolean;
  readonly property: PartProperty;
  readonly targetId: Identifier;
};

/**
 * Gets part relationships added or removed by comparing the previous node and the next node.
 *
 * @param prevNode The previous node, `undefined` if the node did not exist.
 * @param nextNode The next node, `undefined` if the node is deleted.
 */
function getPartChanges(id: Identifier, prevNode: Node | undefined, nextNode: Node | undefined): PartChange[] {
  const partChanges: PartChange[] = [];

  for (const property of ['hasPart', 'isPartOf'] as const) {
    const partIds = getPartIds(nextNode, property);
    const prevPartIds = getPartIds(prevNode, property);

    for (const targetId of prevPartIds) {
      partIds.has(targetId) || partChanges.push(Object.freeze({ id, included: false, property, targetId }));
    }

    for (const targetId of partIds) {
      prevPartIds.has(targetId) || partChanges.push(Object.freeze({ id, included: true, property, targetId }));
    }
  }

  return partChanges;
}

export default getPartChanges;
export type { PartChange };
