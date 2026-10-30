import { getNumber, getParentId, hasType, toNumberValues, withProperties } from './private/nodeProperties';
import getOrderedParts from './private/getOrderedParts';
import { afterPartLeft, detachPart, getRequiredNode, refreshHowToTimestamp } from './private/treeOperations';
import type { GraphIdentifier, GraphTransaction } from './types';
import { FINALIZED, HOW_TO_TYPE, LIVESTREAM_SESSION_TYPE, LOGICAL_TIMESTAMP, STREAM_SEQUENCE } from './vocabulary';

// Moved from `deleteActivityByLocalId.ts`: groupings and sessions are updated in place, nothing is re-sorted.

/**
 * Removes a message from the transcript.
 *
 * QUESTION(William): the store has no delete, so the message node stays in the graph, outside of the tree.
 */
export default function deleteSortedMessage(transaction: GraphTransaction, messageId: GraphIdentifier): void {
  const parentId = getParentId(getRequiredNode(transaction, messageId));

  if (!parentId) {
    throw new Error(`botframework-webchat: Cannot find activity with local ID "${messageId}" to delete`);
  }

  detachPart(transaction, messageId);

  const parent = getRequiredNode(transaction, parentId);

  if (!hasType(parent, LIVESTREAM_SESSION_TYPE)) {
    afterPartLeft(transaction, parentId);

    return;
  }

  const revisions = getOrderedParts(id => transaction.getNode(id), parentId);
  const sessionParentId = getParentId(parent);

  if (!revisions.length) {
    detachPart(transaction, parentId);
    afterPartLeft(transaction, sessionParentId);

    return;
  }

  // The final revision has no sequence number and sorts last.
  // eslint-disable-next-line no-magic-numbers
  const lastRevision = revisions.at(-1);
  const finalRevision = typeof getNumber(lastRevision, STREAM_SEQUENCE) === 'undefined' ? lastRevision : undefined;

  transaction.upsertNode(
    withProperties(parent, {
      [FINALIZED]: finalRevision ? Object.freeze([true]) : undefined,
      [LOGICAL_TIMESTAMP]: toNumberValues(getNumber(finalRevision ?? revisions[0], LOGICAL_TIMESTAMP))
    })
  );

  sessionParentId &&
    hasType(transaction.getNode(sessionParentId), HOW_TO_TYPE) &&
    refreshHowToTimestamp(transaction, sessionParentId);
}
