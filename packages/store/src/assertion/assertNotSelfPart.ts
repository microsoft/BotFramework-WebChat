import type { Node } from '../node/Node.ts';
import getPartIds from '../private/getPartIds.ts';

/**
 * RULE: A node must not be part of itself.
 */
function assertNotSelfPart(node: Node): void {
  const id = node['@id'];

  if (getPartIds(node, 'hasPart').has(id) || getPartIds(node, 'isPartOf').has(id)) {
    throw new Error(`Node "${id}" must not be part of itself`);
  }
}

export default assertNotSelfPart;
