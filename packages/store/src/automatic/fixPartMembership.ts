import { parse } from 'valibot';
import { nodeSchema, type Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import deepFreeze from '../private/deepFreeze.ts';
import getPartIds, { type PartProperty } from '../private/getPartIds.ts';

type PartChange = {
  readonly id: Identifier;
  readonly included: boolean;
  readonly property: PartProperty;
  readonly targetId: Identifier;
};

/**
 * Adds or removes a node reference in the `hasPart` or `isPartOf` property.
 *
 * @returns A new node if the property is changed, otherwise, `undefined`.
 */
function setPartReference(node: Node, property: PartProperty, id: Identifier, included: boolean): Node | undefined {
  const partIds = getPartIds(node, property);

  if (partIds.has(id) === included) {
    return undefined;
  }

  included ? partIds.add(id) : partIds.delete(id);

  const nodeWithoutProperty = Object.fromEntries(Object.entries(node).filter(([key]) => key !== property));

  return deepFreeze(
    parse(
      nodeSchema,
      // OPINION: Empty property value is same as if the property is removed.
      partIds.size
        ? { ...nodeWithoutProperty, [property]: new Set(Array.from(partIds, id => ({ '@id': id }))) }
        : nodeWithoutProperty
    )
  );
}

/**
 * Gets part relationships added or removed by comparing the previous node and the next node.
 */
function getPartChanges(prevNode: Node | undefined, node: Node): PartChange[] {
  const id = node['@id'];
  const partChanges: PartChange[] = [];

  for (const property of ['hasPart', 'isPartOf'] as const) {
    const partIds = getPartIds(node, property);
    const prevPartIds = getPartIds(prevNode, property);

    for (const targetId of prevPartIds) {
      partIds.has(targetId) || partChanges.push({ id, included: false, property, targetId });
    }

    for (const targetId of partIds) {
      prevPartIds.has(targetId) || partChanges.push({ id, included: true, property, targetId });
    }
  }

  return partChanges;
}

/**
 * Auto-fixes part membership: `hasPart` and `isPartOf` are inverse of each other.
 *
 * Compares the committed node with the node in this transaction to find out which part relationships are added or
 * removed, then applies them to the other side. On conflict, addition wins over removal.
 *
 * Deleted nodes are skipped as `delete()` already removed all references to them.
 */
function fixPartMembership(
  prevState: ReadonlyMap<string, Node>,
  nextState: ReadonlyMap<string, Node>,
  affectedNodeIds: ReadonlySet<Identifier>,
  setNode: (node: Node) => void
): void {
  const partChanges = Array.from(affectedNodeIds).flatMap(id => {
    const node = nextState.get(id);

    return node ? getPartChanges(prevState.get(id), node) : [];
  });

  // Apply removals before additions, so addition wins on conflict.
  for (const { id, included, property, targetId } of partChanges.sort(
    (x, y) => Number(x.included) - Number(y.included)
  )) {
    const node = nextState.get(id);
    const targetNode = nextState.get(targetId);

    // Apply to both sides as conflicting changes on the other side may have been applied.
    // Target node could be missing, it will be caught by the reference check.
    const nextNode = node && setPartReference(node, property, targetId, included);
    const nextTargetNode =
      targetNode && setPartReference(targetNode, property === 'hasPart' ? 'isPartOf' : 'hasPart', id, included);

    nextNode && setNode(nextNode);
    nextTargetNode && setNode(nextTargetNode);
  }
}

export default fixPartMembership;
