import { type WebChatActivity } from 'botframework-webchat-core';

import useGroupActivitiesContext from './private/useGroupActivitiesContext';

type GroupedActivities = readonly (readonly WebChatActivity[])[];

export default function useGroupActivities(): ({
  activities,
  group
}: Readonly<{
  activities: readonly WebChatActivity[];
  group?: string | undefined;
}>) => Readonly<{
  [key: string]: GroupedActivities;
}> {
  return useGroupActivitiesContext().groupActivities;
}
