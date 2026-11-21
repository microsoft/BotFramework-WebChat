import type { FrozenInternalNode } from '../private/FrozenInternalNode.ts';
import { getHasPartIds, getIsPartOfIds } from '../private/getPartIds.ts';
import type { DraftNode } from '../private/DraftNode.ts';

/**
 * RULE: A node must not be part of itself.
 */
function assertNotSelfPart(node: DraftNode | FrozenInternalNode): void {
  const id = node['@id'];

  if (getHasPartIds(node).has(id) || getIsPartOfIds(node).has(id)) {
    throw new Error(`Node "${id}" must not be part of itself`);
  }
}

export default assertNotSelfPart;
