import type { WebChatActivity } from 'botframework-webchat-core';

export default function getActivityUniqueId(activity: WebChatActivity): string {
  return activity?.channelData?.clientActivityID || activity?.id;
}
