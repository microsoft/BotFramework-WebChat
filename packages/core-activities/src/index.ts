// The activities core: the activities graph (William's store), the per-activity operations on it, and the activity wire
// format. No Redux: `botframework-webchat-core` bundles this package and reduces with it. Other packages reach it through
// `botframework-webchat-core/activities` only, so there is one copy of this module (its caches are per module).

export { type ActivitiesCoreEnv } from './ActivitiesCoreEnv';
export { default as deleteActivityByLocalId } from './deleteActivityByLocalId';
export { CONVERSATION_ID, default as createActivitiesGraph, type ActivitiesGraph } from './graph/createActivitiesGraph';
export { default as getSortedMessages, type GetParts } from './graph/getSortedMessages';
export { hasBotActivity, hasReplyTarget } from './graph/queries';
export {
  type GetNode,
  type GraphIdentifier,
  type GraphNode,
  type GraphStore,
  type GraphTransaction
} from './graph/types';
export { default as patchActivity } from './patchActivity';
export { default as createInitialState } from './operations/createInitialState';
export { default as deleteActivityById } from './operations/deleteActivityById';
export { default as markActivity } from './operations/markActivity';
export { default as postActivityFulfilled } from './operations/postActivityFulfilled';
export { default as postActivityImpeded } from './operations/postActivityImpeded';
export { default as postActivityPending } from './operations/postActivityPending';
export { default as postActivityRejected } from './operations/postActivityRejected';
export { default as receiveActivity } from './operations/receiveActivity';
export { default as getLogicalTimestamp } from './private/getLogicalTimestamp';
export {
  default as getPartGroupingMetadataMap,
  type PartGroupingMetadataMapEntry
} from './private/getPartGroupingMetadataMap';
export {
  generateLocalIdInActivity,
  getLocalIdFromActivity,
  LocalIdSchema,
  setLocalIdInActivity,
  type LocalId
} from './property/LocalId';
export {
  getPositionFromActivity,
  PositionSchema,
  queryPositionFromActivity,
  setPositionInActivity,
  type Position
} from './property/Position';
export {
  getReceivedAtFromActivity,
  queryReceivedAtFromActivity,
  ReceivedAtSchema,
  setReceivedAtInActivity,
  type ReceivedAt
} from './property/ReceivedAt';
export {
  getSendStatusFromOutgoingActivity,
  querySendStatusFromOutgoingActivity,
  SendStatusSchema,
  setSendStatusInOutgoingActivity,
  type SendStatus
} from './property/SendStatus';
export {
  getActivities,
  getActivityByLocalId,
  getHowToGrouping,
  getLivestreamSession,
  getSortedChatHistory
} from './queries';
export { default as queryLocalIdByActivityId } from './queryLocalIdByActivityId';
export { default as queryLocalIdByClientActivityId } from './queryLocalIdByClientActivityId';
export { default as ReplyToIdHold, DEFAULT_TIMEOUT, type ReplyToIdHoldInit } from './ReplyToIdHold';
export {
  type ActivitiesCoreState,
  type Activity,
  type ActivityEntry,
  type ActivityMap,
  type ActivityMapEntry,
  type HowToGroupingEntry,
  type HowToGroupingId,
  type HowToGroupingMap,
  type HowToGroupingMapEntry,
  type HowToGroupingMapPartEntry,
  type LivestreamSessionEntry,
  type LivestreamSessionId,
  type LivestreamSessionMap,
  type LivestreamSessionMapEntry,
  type LivestreamSessionMapEntryActivityEntry,
  type SortedChatHistory,
  type SortedChatHistoryEntry,
  type State
} from './types';
export { type AnyAnd } from './types/AnyAnd';
export { type DirectLineAttachment } from './types/external/DirectLineAttachment';
export { type DirectLineCardAction } from './types/external/DirectLineCardAction';
export { type DirectLineSuggestedAction } from './types/external/DirectLineSuggestedAction';
export { type WebChatCallURLCardAction } from './types/internal/WebChatCallURLCardAction';
export { SEND_FAILED, SENDING, SENT } from './types/internal/SendStatus';
export { type WebChatActivity } from './types/WebChatActivity';
export {
  default as updateActivityChannelData,
  updateActivityChannelDataInternalSkipNameCheck
} from './updateActivityChannelData';
export { default as upsert, INITIAL_STATE } from './upsert';
export { default as getActivityLivestreamingMetadata } from './utils/getActivityLivestreamingMetadata';
export { default as getOrgSchemaMessage } from './utils/getOrgSchemaMessage';
