import type { WebChatActivity } from 'botframework-webchat-core';

export default function getClientActivityId(activity: WebChatActivity): string {
  return activity.channelData?.clientActivityID;
}
