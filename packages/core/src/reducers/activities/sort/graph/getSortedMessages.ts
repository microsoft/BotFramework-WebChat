import getOrderedParts from './private/getOrderedParts';
import { getBoolean, hasType } from './private/nodeProperties';
import type { GetNode, GraphIdentifier, GraphNode } from './types';
import { FINALIZED, HOW_TO_TYPE, LIVESTREAM_SESSION_TYPE } from './vocabulary';

/**
 * Derived view: the messages of a conversation in display order.
 *
 * Walks the `hasPart` tree by `position`. A finalized livestream session shows only its final revision; the other
 * revisions stay in the graph.
 *
 * Moved from `computeSortedActivities.ts`.
 */
export default function getSortedMessages(getNode: GetNode, conversationId: GraphIdentifier): readonly GraphNode[] {
  const messages: GraphNode[] = [];

  (function visit(parentId: GraphIdentifier) {
    for (const part of getOrderedParts(getNode, parentId)) {
      if (hasType(part, LIVESTREAM_SESSION_TYPE)) {
        const revisions = getOrderedParts(getNode, part['@id']);

        // eslint-disable-next-line no-magic-numbers
        messages.push(...(getBoolean(part, FINALIZED) ? revisions.slice(-1) : revisions));
      } else if (hasType(part, HOW_TO_TYPE)) {
        visit(part['@id']);
      } else {
        messages.push(part);
      }
    }
  })(conversationId);

  return Object.freeze(messages);
}
