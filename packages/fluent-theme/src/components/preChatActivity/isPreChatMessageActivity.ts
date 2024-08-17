import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat-core';

export default function isPreChatMessageActivity(
  activity: undefined | WebChatActivity
): activity is WebChatActivity & { type: 'message' } {
  return !!(activity && getOrgSchemaMessage(activity?.entities || [])?.keywords?.includes('PreChatMessage'));
}
