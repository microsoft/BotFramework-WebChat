import type { Identifier } from '../../node/NodeIdentifier.ts';
import { getActivityIdentifier, getClientActivityIdentifier } from './activityIdentifier.ts';
import { getAudienceId } from './audience.ts';
import type { DirectLineActivity } from './DirectLineActivity.ts';

const DIRECT_LINE_ACTIVITY_TYPE = 'urn:microsoft:webchat:direct-line-activity';

type CreativeWorkStatus = 'Draft' | 'Published';

type ActivityToNodeInit = {
  readonly conversationId: Identifier;
  /** `"Published"` if the activity is from the server, `"Draft"` if the activity is outgoing from the client. */
  readonly creativeWorkStatus: CreativeWorkStatus;
  /** `dateCreated` of the node, or `undefined` if the node should not be part of the conversation. */
  readonly dateCreated: string | undefined;
  readonly id: Identifier;
};

/**
 * Converts an activity into a node, see `createGraphFromStore()` of `botframework-webchat-core`.
 *
 * - Message and typing activities are `Message`, other activities are `urn:microsoft:webchat:direct-line-activity`
 * - Server activity ID and client activity ID (outgoing activity only) are put in `identifier`
 * - The original activity is put in `urn:microsoft:webchat:direct-line-activity:raw-json` as JSON literal
 */
function activityToNode(activity: DirectLineActivity, init: ActivityToNodeInit) {
  const { conversationId, creativeWorkStatus, dateCreated, id } = init;
  const {
    channelData,
    from: { role },
    id: activityId,
    text,
    textFormat,
    type
  } = activity;

  // Client activity ID is only for outgoing activity. Bot could copy `channelData` from the user, which should be ignored.
  const clientActivityId = role === 'user' ? channelData?.clientActivityID : undefined;
  const identifier = new Set([
    ...(activityId ? [getActivityIdentifier(activityId)] : []),
    ...(clientActivityId ? [getClientActivityIdentifier(clientActivityId)] : [])
  ]);
  const isMessage = type === 'message' || type === 'typing';

  return {
    '@id': id,
    '@type': new Set(isMessage ? ['Message', DIRECT_LINE_ACTIVITY_TYPE] : [DIRECT_LINE_ACTIVITY_TYPE]),
    creativeWorkStatus: [creativeWorkStatus],
    ...(dateCreated ? { dateCreated, isPartOf: new Set([{ '@id': conversationId }]) } : {}),
    ...(isMessage
      ? { encodingFormat: [typeof textFormat === 'string' && textFormat !== 'markdown' ? 'text/plain' : 'text/markdown'] }
      : {}),
    ...(identifier.size ? { identifier } : {}),
    sender: [{ '@id': getAudienceId(role === 'bot' ? 'others' : role === 'user' ? 'self' : 'channel') }],
    ...(isMessage && text ? { text: [text] } : {}),
    'urn:microsoft:webchat:direct-line-activity:raw-json': [{ '@type': '@json', '@value': activity }],
    'urn:microsoft:webchat:direct-line-activity:type': [type]
  } as const;
}

export default activityToNode;
export { type ActivityToNodeInit, type CreativeWorkStatus };
