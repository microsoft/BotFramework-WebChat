import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import createNode from '../private/createNode.ts';
import getPartChanges from '../private/getPartChanges.ts';
import getPartIds, { type PartProperty } from '../private/getPartIds.ts';

type PartDelta = {
  /** Key is the ID of the target node, value is `true` to include, `false` to exclude. */
  readonly hasPart: Map<Identifier, boolean>;
  readonly isPartOf: Map<Identifier, boolean>;
};

/**
 * Applies all part changes of a node at once.
 *
 * @returns A new node if any part property is changed, otherwise, `undefined`.
 */
function applyPartDelta(node: Node, partDelta: PartDelta): Node | undefined {
  const nextEntries = new Map<string, unknown>(Object.entries(node));
  let changed = false;

  for (const property of ['hasPart', 'isPartOf'] as const) {
    const partIds = getPartIds(node, property);
    const effectiveDelta = Array.from(
      property === 'hasPart' ? partDelta.hasPart : partDelta.isPartOf,
      ([targetId, included]) => [targetId, included] as const
    ).filter(([targetId, included]) => partIds.has(targetId) !== included);

    if (effectiveDelta.length) {
      // `getPartIds()` returns a read-only cached `Set`, copy before modifying.
      const nextPartIds = new Set(partIds);

      for (const [targetId, included] of effectiveDelta) {
        included ? nextPartIds.add(targetId) : nextPartIds.delete(targetId);
      }

      changed = true;

      // OPINION: Empty property value is same as if the property is removed.
      nextPartIds.size
        ? nextEntries.set(property, new Set(Array.from(nextPartIds, id => ({ '@id': id }))))
        : nextEntries.delete(property);
    }
  }

  return changed ? createNode(Object.fromEntries(nextEntries)) : undefined;
}

/**
 * Auto-fixes part membership: `hasPart` and `isPartOf` are inverse of each other.
 *
 * Compares the node at the last fix point with the node now to find out which part relationships are added or removed,
 * then applies them to the other side. On conflict, addition wins over removal.
 *
 * Changes are batched: all changes to the same node are applied at once, so every node is rebuilt at most once.
 *
 * Deleted nodes are skipped as `delete()` already removed all references to them.
 *
 * @param prevNodes Nodes changed since the last fix point, with their values at the last fix point (`undefined` if the
 *                  node did not exist).
 */
function fixPartMembership(
  prevNodes: ReadonlyMap<Identifier, Node | undefined>,
  nextState: ReadonlyMap<string, Node>,
  setNode: (node: Node) => void
): void {
  const partChanges = Array.from(prevNodes).flatMap(([id, prevNode]) => {
    const node = nextState.get(id);

    return node ? getPartChanges(id, prevNode, node) : [];
  });

  const partDeltas = new Map<Identifier, PartDelta>();

  const recordPartChange = (id: Identifier, property: PartProperty, targetId: Identifier, included: boolean): void => {
    let partDelta = partDeltas.get(id);

    partDelta || partDeltas.set(id, (partDelta = { hasPart: new Map(), isPartOf: new Map() }));

    (property === 'hasPart' ? partDelta.hasPart : partDelta.isPartOf).set(targetId, included);
  };

  // Record removals before additions, so addition wins on conflict.
  // Record on both sides as conflicting changes may be made on the other side.
  for (const { id, included, property, targetId } of partChanges.sort(
    (x, y) => Number(x.included) - Number(y.included)
  )) {
    recordPartChange(id, property, targetId, included);
    recordPartChange(targetId, property === 'hasPart' ? 'isPartOf' : 'hasPart', id, included);
  }

  for (const [id, partDelta] of partDeltas) {
    // Target node could be missing, it will be caught by the reference check.
    const node = nextState.get(id);
    const nextNode = node && applyPartDelta(node, partDelta);

    nextNode && setNode(nextNode);
  }
}

export default fixPartMembership;
