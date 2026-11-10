import type { Node } from '../node/Node.ts';

/**
 * RULE: `identifier` (alternate identifiers) of a node must not contain its own `@id` (primary identifier).
 */
function assertIdentifierNotId(node: Pick<Node, '@id' | 'identifier'>): void {
  const id = node['@id'];

  if (node.identifier?.has(id)) {
    throw new Error(`Node "${id}" must not have its own @id in identifier`);
  }
}

export default assertIdentifierNotId;
