import { useMemo } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import { useSelector } from './internal/WebChatReduxContext';

export default function useActivitiesWithHistory(): [WebChatActivity[][]] {
  const activities = useSelector(({ activities }) => activities);

  const activitiesWithHistory = useMemo(() => {
    const map = new Map<string, number>();
    return activities.reduce((result: WebChatActivity[][], activity: WebChatActivity) => {
      const {
        id,
        channelData: { updateActivityId } = {},
        from: { role }
      } = activity;

      if (role === 'bot' && id && updateActivityId && map.has(updateActivityId)) {
        const index = map.get(updateActivityId);
        // eslint-disable-next-line security/detect-object-injection
        result[index].push(activity);
        map.set(id, index);
      } else {
        result.push([activity]);
        id && map.set(id, result.length - 1);
      }
      return result;
    }, []);
  }, [activities]);

  return [activitiesWithHistory];
}
