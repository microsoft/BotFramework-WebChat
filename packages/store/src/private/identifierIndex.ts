import assertUniqueIdentifier from '../assertion/assertUniqueIdentifier.ts';
import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import FrozenSet from '../structure/FrozenSet.ts';
import type { ReadWriteMap } from '../structure/FrozenMap.ts';

const EMPTY_IDENTIFIERS: ReadonlySet<Identifier> = new FrozenSet<Identifier>([]);

/** Gets alternate identifiers in the `identifier` property, empty if not set or the node does not exist. */
function getIdentifiers(node: Pick<Node, 'identifier'> | undefined): ReadonlySet<Identifier> {
  return node?.identifier ?? EMPTY_IDENTIFIERS;
}

/**
 * Updates the index of alternate identifiers (key is the alternate identifier, value is `@id` of the node), and
 * verifies every identifier identifies at most one node.
 *
 * This is O(number of alternate identifiers of affected nodes), regardless of the size of the graph.
 *
 * @returns IDs of affected nodes, plus their alternate identifiers before and after the change.
 */
function updateIdentifierIndex(
  prevState: ReadonlyMap<string, Node>,
  nextState: ReadonlyMap<string, Node>,
  identifierIndex: ReadWriteMap<Identifier, Identifier>,
  affectedNodeIds: ReadonlySet<Identifier>
): Set<Identifier> {
  const additions: [Identifier, Identifier][] = [];
  const affectedIdentifiers = new Set<Identifier>(affectedNodeIds);

  for (const id of affectedNodeIds) {
    const prevIdentifiers = getIdentifiers(prevState.get(id));
    const nextIdentifiers = getIdentifiers(nextState.get(id));

    // The previous state is consistent, the removed identifier must be owned by this node.
    for (const identifier of prevIdentifiers) {
      affectedIdentifiers.add(identifier);
      nextIdentifiers.has(identifier) || identifierIndex.delete(identifier);
    }

    for (const identifier of nextIdentifiers) {
      affectedIdentifiers.add(identifier);
      prevIdentifiers.has(identifier) || additions.push([identifier, id]);
    }
  }

  // Removes first, so nodes could swap identifiers in the same transaction.
  for (const [identifier, id] of additions) {
    assertUniqueIdentifier(nextState, identifierIndex, identifier, id);
    identifierIndex.set(identifier, id);
  }

  // `@id` of new nodes must not be an alternate identifier of another node.
  for (const id of affectedNodeIds) {
    nextState.has(id) && assertUniqueIdentifier(nextState, identifierIndex, id, id);
  }

  return affectedIdentifiers;
}

export { updateIdentifierIndex };
