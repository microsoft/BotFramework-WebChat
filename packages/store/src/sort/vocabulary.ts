import { type BlankNodeIdentifier } from '../node/BlankNodeIdentifier.ts';

// QUESTION(William): vocabulary for sort facts. Custom IRIs under `urn:microsoft:webchat:`, the same prefix as
//                    `packages/core/src/graph/createGraphFromStore.ts` uses for Direct Line properties.

/** `true` when the livestream session received its final revision. Later revisions are dropped. */
const FINALIZED = 'urn:microsoft:webchat:sort:finalized';

/** Fallback sort key (milliseconds) used only between two messages without logical timestamps. */
const LOCAL_TIMESTAMP = 'urn:microsoft:webchat:sort:local-timestamp';

/**
 * Sort key (milliseconds or sequence ID).
 *
 * On a message: from the message itself. On a livestream session: from its first revision, replaced by the final one.
 * On a HowTo: the latest of its parts.
 */
const LOGICAL_TIMESTAMP = 'urn:microsoft:webchat:sort:logical-timestamp';

/** Position declared by the sender inside its HowTo (schema.org `Message.position`). Can be missing or duplicated. */
const PART_POSITION = 'urn:microsoft:webchat:sort:part-position';

/** Sequence number of an interim livestream revision. The final revision has none and sorts last. */
const STREAM_SEQUENCE = 'urn:microsoft:webchat:sort:stream-sequence';

const CONVERSATION_TYPE = 'Conversation';
const HOW_TO_TYPE = 'HowTo';
const LIVESTREAM_SESSION_TYPE = 'urn:microsoft:webchat:livestream-session';

function getHowToNodeId(groupingId: string): BlankNodeIdentifier {
  return `_:webchat:how-to:${encodeURIComponent(groupingId)}`;
}

function getLivestreamSessionNodeId(sessionId: string): BlankNodeIdentifier {
  return `_:webchat:livestream-session:${encodeURIComponent(sessionId)}`;
}

export {
  CONVERSATION_TYPE,
  FINALIZED,
  getHowToNodeId,
  getLivestreamSessionNodeId,
  HOW_TO_TYPE,
  LIVESTREAM_SESSION_TYPE,
  LOCAL_TIMESTAMP,
  LOGICAL_TIMESTAMP,
  PART_POSITION,
  STREAM_SEQUENCE
};
