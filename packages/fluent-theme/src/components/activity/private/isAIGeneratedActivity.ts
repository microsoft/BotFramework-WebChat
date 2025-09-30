import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat/internal';

export default function isAIGeneratedActivity(activity: undefined | WebChatActivity) {
  return !!(activity && getOrgSchemaMessage(activity?.entities || [])?.keywords?.includes('AIGeneratedContent'));
}
