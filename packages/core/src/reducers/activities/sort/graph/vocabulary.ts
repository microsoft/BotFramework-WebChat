// QUESTION(William): vocabulary of the activities graph. Custom IRIs under `urn:microsoft:webchat:`, the same prefix as
//                    `packages/core/src/graph/createGraphFromStore.ts` uses for Direct Line properties.

/** The activity as received, boxed as a JSON literal (`{ "@type": "@json", "@value": activity }`). */
const DIRECT_LINE_ACTIVITY = 'urn:microsoft:webchat:direct-line-activity:raw-json';

/** `true` when the livestream session received its final revision. Later revisions are dropped. */
const FINALIZED = 'urn:microsoft:webchat:sort:finalized';

/** schema.org `identifier`: the ID of a HowTo grouping or a livestream session as the sender wrote it. */
const IDENTIFIER = 'identifier';

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

/** Send status of an outgoing message: "sending", "send failed" or "sent". Pending William (question 4). */
const SEND_STATUS = 'urn:microsoft:webchat:send-status';

/** Sequence number of an interim livestream revision. The final revision has none and sorts last. */
const STREAM_SEQUENCE = 'urn:microsoft:webchat:sort:stream-sequence';

const CONVERSATION_TYPE = 'Conversation';
const DIRECT_LINE_ACTIVITY_TYPE = 'urn:microsoft:webchat:direct-line-activity';
const HOW_TO_TYPE = 'HowTo';
const LIVESTREAM_SESSION_TYPE = 'urn:microsoft:webchat:livestream-session';
const MESSAGE_TYPE = 'Message';

function getHowToNodeId(groupingId: string): `_:${string}` {
  return `_:webchat:how-to:${encodeURIComponent(groupingId)}`;
}

function getLivestreamSessionNodeId(sessionId: string): `_:${string}` {
  return `_:webchat:livestream-session:${encodeURIComponent(sessionId)}`;
}

export {
  CONVERSATION_TYPE,
  DIRECT_LINE_ACTIVITY,
  DIRECT_LINE_ACTIVITY_TYPE,
  FINALIZED,
  getHowToNodeId,
  getLivestreamSessionNodeId,
  HOW_TO_TYPE,
  IDENTIFIER,
  LIVESTREAM_SESSION_TYPE,
  LOCAL_TIMESTAMP,
  LOGICAL_TIMESTAMP,
  MESSAGE_TYPE,
  PART_POSITION,
  SEND_STATUS,
  STREAM_SEQUENCE
};
