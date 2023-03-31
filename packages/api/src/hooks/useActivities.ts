import type { WebChatActivity } from 'botframework-webchat-core';

import useActivitiesWithHistory from './useActivitiesWithHistory';

export default function useActivities(): [WebChatActivity[]] {
  const [activitiesWithHistory] = useActivitiesWithHistory();
  return [activitiesWithHistory.map((activities: WebChatActivity[]) => activities[activities.length - 1])];
}
