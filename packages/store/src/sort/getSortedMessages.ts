import { parse } from 'valibot';
import type { Node } from '../node/Node.ts';
import { identifierSchema, type Identifier } from '../node/NodeIdentifier.ts';
import getOrderedParts from './private/getOrderedParts.ts';
import { getBoolean, hasType } from './private/nodeProperties.ts';
import { FINALIZED, HOW_TO_TYPE, LIVESTREAM_SESSION_TYPE } from './vocabulary.ts';

/**
 * Derived view: the messages of a conversation in display order.
 *
 * Walks the `hasPart` tree by `position`. A finalized livestream session shows only its final revision; the other
 * revisions stay in the graph.
 *
 * Ported from `packages/core/src/reducers/activities/sort/private/computeSortedActivities.ts`.
 */
export default function getSortedMessages(
  snapshot: ReadonlyMap<string, Node>,
  conversationId: Identifier
): readonly Node[] {
  const getNode = (id: Identifier) => snapshot.get(id);
  const messages: Node[] = [];

  (function visit(parentId: Identifier) {
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
  })(parse(identifierSchema, conversationId));

  return Object.freeze(messages);
}
