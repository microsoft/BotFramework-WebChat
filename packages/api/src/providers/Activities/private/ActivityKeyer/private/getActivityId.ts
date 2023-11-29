import type { WebChatActivity } from 'botframework-webchat-core';

export default function getActivityId(activity: WebChatActivity): string {
  return activity.id;
}
