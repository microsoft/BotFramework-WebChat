import type { WebChatActivity } from 'botframework-webchat-core';

type GroupedRenderingActivities = Readonly<{
  activities: readonly WebChatActivity[];
  children: readonly GroupedRenderingActivities[];
  key: string;
  type: string;
}>;

export { type GroupedRenderingActivities };
