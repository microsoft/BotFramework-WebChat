import { type WebChatActivity } from 'botframework-webchat-core';

import useGroupActivitiesContext from './private/useGroupActivitiesContext';

export default function useGroupActivitiesBy(): (
  activities: readonly WebChatActivity[],
  name: string
) => readonly (readonly WebChatActivity[])[] {
  return useGroupActivitiesContext().groupActivitiesByName;
}
