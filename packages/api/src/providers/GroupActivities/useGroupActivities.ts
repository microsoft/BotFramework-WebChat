import { type WebChatActivity } from 'botframework-webchat-core';
import useGroupActivitiesContext from './private/useGroupActivitiesContext';

type GroupedActivities = readonly (readonly WebChatActivity[])[];

export default function useGroupActivities(): ({
  activities
}: Readonly<{ activities: readonly WebChatActivity[] }>) => Readonly<{
  [key: string]: GroupedActivities;
}> {
  return useGroupActivitiesContext().groupActivities;
}
