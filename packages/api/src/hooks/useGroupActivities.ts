import { type WebChatActivity } from 'botframework-webchat-core';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

type GroupedActivities = readonly (readonly WebChatActivity[])[];

export default function useGroupActivities(): ({
  activities
}: Readonly<{ activities: readonly WebChatActivity[] }>) => Readonly<{
  [key: string]: GroupedActivities;
}> {
  return useWebChatAPIContext().groupActivities;
}
