import { getBoolean, hasType } from './private/nodeProperties';
import type { GetNode, GraphIdentifier, GraphNode } from './types';
import { FINALIZED, HOW_TO_TYPE, LIVESTREAM_SESSION_TYPE } from './vocabulary';

type GetParts = (parentId: GraphIdentifier) => readonly GraphIdentifier[];

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

  (function visit(parentId: GraphIdentifier) {
    const partIds = getParts(parentId);

    // Index loops: this runs over every displayed activity of every action.
    for (let index = 0; index < partIds.length; index++) {
      // eslint-disable-next-line security/detect-object-injection
      const partId = partIds[index]!;
      const part = getNode(partId);

      if (!part) {
        continue;
      } else if (hasType(part, LIVESTREAM_SESSION_TYPE)) {
        const revisionIds = getParts(partId);
        // eslint-disable-next-line no-magic-numbers
        const shownRevisionIds = getBoolean(part, FINALIZED) ? revisionIds.slice(-1) : revisionIds;

        for (let revisionIndex = 0; revisionIndex < shownRevisionIds.length; revisionIndex++) {
          // eslint-disable-next-line security/detect-object-injection
          const revision = getNode(shownRevisionIds[revisionIndex]!);

          revision && messages.push(revision);
        }
      } else if (hasType(part, HOW_TO_TYPE)) {
        visit(partId);
      } else {
        messages.push(part);
      }
    }
  })(conversationId);

  return Object.freeze(messages);
}

export { type GetParts };
