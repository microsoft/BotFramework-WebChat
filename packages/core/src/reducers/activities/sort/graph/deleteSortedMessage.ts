import { getNumber, getParentId, hasType, toNumberValues, withProperties } from './private/nodeProperties';
import { afterPartLeft, detachPart, getRequiredNode, refreshHowToTimestamp } from './private/treeOperations';
import type WorkingGraph from './private/WorkingGraph';
import type { GraphIdentifier } from './types';
import { FINALIZED, HOW_TO_TYPE, LIVESTREAM_SESSION_TYPE, LOGICAL_TIMESTAMP, STREAM_SEQUENCE } from './vocabulary';

// Moved from `deleteActivityByLocalId.ts`: groupings and sessions are updated in place, nothing is re-sorted.

/**
 * Removes a message from the transcript.
 *
 * QUESTION(William): the store has no delete, so the message node stays in the graph, outside of the tree.
 */
export default function deleteSortedMessage(working: WorkingGraph, messageId: GraphIdentifier): void {
  const parentId = getParentId(getRequiredNode(working, messageId));

  if (!parentId) {
    throw new Error(`botframework-webchat: Cannot find activity with local ID "${messageId}" to delete`);
  }

  detachPart(working, messageId);

  const parent = getRequiredNode(working, parentId);

  if (!hasType(parent, LIVESTREAM_SESSION_TYPE)) {
    afterPartLeft(working, parentId);

    return;
  }

  const revisionIds = working.getParts(parentId);
  const sessionParentId = getParentId(parent);

  if (!revisionIds.length) {
    detachPart(working, parentId);
    afterPartLeft(working, sessionParentId);

    return;
  }

  // The final revision has no sequence number and sorts last.
  // eslint-disable-next-line no-magic-numbers
  const lastRevision = working.getNode(revisionIds.at(-1) ?? parentId);
  const finalRevision = typeof getNumber(lastRevision, STREAM_SEQUENCE) === 'undefined' ? lastRevision : undefined;
  const firstRevision = working.getNode(revisionIds[0] ?? parentId);

  working.setNode(
    withProperties(parent, {
      [FINALIZED]: finalRevision ? Object.freeze([true]) : undefined,
      [LOGICAL_TIMESTAMP]: toNumberValues(getNumber(finalRevision ?? firstRevision, LOGICAL_TIMESTAMP))
    })
  );

  sessionParentId &&
    hasType(working.getNode(sessionParentId), HOW_TO_TYPE) &&
    refreshHowToTimestamp(working, sessionParentId);
}
