import { type WebChatActivity } from 'botframework-webchat-core';

type GroupedRenderingActivities = Readonly<{
  activities: readonly WebChatActivity[];
  children: readonly GroupedRenderingActivities[];
  key: string;
  groupingName: string | undefined;
}>;

export { type GroupedRenderingActivities };
