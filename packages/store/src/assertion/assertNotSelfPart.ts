import type { FrozenInternalNode } from '../private/FrozenInternalNode.ts';
import getPartIds from '../private/getPartIds.ts';
import type { UnfrozenInternalNode } from '../private/UnfrozenInternalNode.ts';

/**
 * RULE: A node must not be part of itself.
 */
function assertNotSelfPart(node: FrozenInternalNode | UnfrozenInternalNode): void {
  const id = node['@id'];

  if (getPartIds(node, 'hasPart').has(id) || getPartIds(node, 'isPartOf').has(id)) {
    throw new Error(`Node "${id}" must not be part of itself`);
  }
}

export default assertNotSelfPart;
