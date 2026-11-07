import type { GetNode, GraphIdentifier, GraphNode } from '../types';
import { FINALIZED, HOW_TO_TYPE, LIVESTREAM_SESSION_TYPE } from '../vocabulary';
import { getBoolean, getParentId, hasType } from './nodeProperties';

// The displayed list (`state.activities`) is the conversation's parts, each expanded to its displayed messages: a
// message is itself, a livestream session is its revisions (only the final one once finalized), a HowTo is its parts.
// So a transaction that changes some parts of the conversation only changes the displayed messages of those parts:
// these helpers find them, so the displayed list and its positions are patched from the first changed part on instead
// of walking the whole tree (`stampActivityPositions()`, `deriveState()`).

type GetParts = (parentId: GraphIdentifier) => readonly GraphIdentifier[];

// The tree has 4 levels (conversation, HowTo, livestream session, message), the limit only guards against a cycle.
const MAX_DEPTH = 16;

/**
 * Appends the displayed messages of a part to `messages`, in display order. A finalized livestream session shows only
 * its final revision; the other revisions stay in the graph.
 */
function pushDisplayedMessages(
  getNode: GetNode,
  getParts: GetParts,
  partId: GraphIdentifier,
  messages: GraphNode[]
): void {
  const part = getNode(partId);

  if (part && hasType(part, LIVESTREAM_SESSION_TYPE)) {
    const revisionIds = getParts(partId);
    // eslint-disable-next-line no-magic-numbers
    const shownRevisionIds = getBoolean(part, FINALIZED) ? revisionIds.slice(-1) : revisionIds;

    // Index loops: this runs over every displayed activity of a walk.
    for (let index = 0; index < shownRevisionIds.length; index++) {
      // eslint-disable-next-line security/detect-object-injection
      const revision = getNode(shownRevisionIds[index]!);

      revision && messages.push(revision);
    }
  } else if (part && hasType(part, HOW_TO_TYPE)) {
    const partIds = getParts(partId);

    for (let index = 0; index < partIds.length; index++) {
      // eslint-disable-next-line security/detect-object-injection
      pushDisplayedMessages(getNode, getParts, partIds[index]!, messages);
    }
  } else if (part) {
    messages.push(part);
  }
}

/**
 * The parts of the conversation whose displayed messages may have changed in a transaction: for every changed node
 * and every parent whose parts changed, the part of the conversation it is in, before and after the transaction.
 *
 * The other parts are unchanged: same nodes, same parts, same activities (core sets an activity with its node).
 *
 * @param getNodes Reads the nodes after the transaction, and before it.
 */
function getChangedConversationParts(
  conversationId: GraphIdentifier,
  changedIds: Iterable<GraphIdentifier>,
  getNodes: readonly GetNode[]
): ReadonlySet<GraphIdentifier> {
  const changedPartIds = new Set<GraphIdentifier>();

  for (const id of changedIds) {
    for (const getNode of getNodes) {
      for (let current = id, depth = 0; depth < MAX_DEPTH; depth++) {
        const parentId = getParentId(getNode(current));

        if (!parentId) {
          break;
        } else if (parentId === conversationId) {
          changedPartIds.add(current);

          break;
        }

        current = parentId;
      }
    }
  }

  return changedPartIds;
}

/**
 * Where the parts of the conversation changed, from the changed parts (`getChangedConversationParts()`).
 *
 * Unchanged parts keep their relative order (a part that moves gets a new `position`, or moves the parts it passes),
 * and a part that joins or leaves the conversation is changed. So:
 *
 * - `firstIndex`: the parts before it are the same in both arrays, and unchanged;
 * - `lastIndex`: the parts after it in `partIds` are unchanged, and in the same order as in `prevPartIds` (-1 if no
 *   changed part is in `partIds`).
 */
function getChangedRange(
  partIds: readonly GraphIdentifier[],
  prevPartIds: readonly GraphIdentifier[],
  changedPartIds: ReadonlySet<GraphIdentifier>
): { readonly firstIndex: number; readonly lastIndex: number } {
  let firstIndex = Math.min(partIds.length, prevPartIds.length);
  let lastIndex = -1;

  changedPartIds.forEach(id => {
    // IDs are unique: `lastIndexOf()` is the same index, found fast for appends (the common case).
    const index = partIds.lastIndexOf(id);
    const prevIndex = prevPartIds.lastIndexOf(id);

    ~index && (firstIndex = Math.min(firstIndex, index));
    ~prevIndex && (firstIndex = Math.min(firstIndex, prevIndex));
    lastIndex = Math.max(lastIndex, index);
  });

  return Object.freeze({ firstIndex, lastIndex });
}

export { getChangedConversationParts, getChangedRange, pushDisplayedMessages, type GetParts };
