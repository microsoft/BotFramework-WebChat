import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';

/**
 * RULE: An identifier, either `@id` or in `identifier` (alternate identifiers), must identify at most one node.
 *
 * Nodes could swap alternate identifiers in the same transaction, thus, it is verified on commit after identifiers
 * removed from nodes are removed from the index.
 *
 * @param identifierIndex Map of alternate identifiers to `@id` of the node which has the alternate identifier.
 * @param identifier The identifier to verify, either the `@id` of the owner node or one of its alternate identifiers.
 * @param ownerId `@id` of the node which has the identifier.
 */
function assertUniqueIdentifier(
  state: ReadonlyMap<string, Node>,
  identifierIndex: ReadonlyMap<Identifier, Identifier>,
  identifier: Identifier,
  ownerId: Identifier
): void {
  const otherId = identifier !== ownerId && state.has(identifier) ? identifier : identifierIndex.get(identifier);

  if (otherId && otherId !== ownerId) {
    throw new Error(`Identifier "${identifier}" of node "${ownerId}" is already used by node "${otherId}"`);
  }
}

export default assertUniqueIdentifier;
