import { pushDisplayedMessages, type GetParts } from './private/displayedMessages';
import type { GetNode, GraphIdentifier, GraphNode } from './types';

/**
 * Derived view: the messages of a conversation in display order.
 *
 * Walks the `isPartOf` tree by `position` (through the part index). A finalized livestream session shows only its final
 * revision; the other revisions stay in the graph.
 *
 * Moved from `computeSortedActivities.ts`.
 */
export default function getSortedMessages(
  getNode: GetNode,
  getParts: GetParts,
  conversationId: GraphIdentifier
): readonly GraphNode[] {
  const messages: GraphNode[] = [];
  const partIds = getParts(conversationId);

  // Index loop: this runs over every displayed activity of a walk.
  for (let index = 0; index < partIds.length; index++) {
    // eslint-disable-next-line security/detect-object-injection
    pushDisplayedMessages(getNode, getParts, partIds[index]!, messages);
  }

  return Object.freeze(messages);
}

export { type GetParts };
