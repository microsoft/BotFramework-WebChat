import { useMemo } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import type { ActivityWithRenderer } from './types';
import useMemoized from '../../../hooks/internal/useMemoized';

export default function useActivitiesWithRenderer(
  activities: readonly WebChatActivity[],
  createActivityRenderer
): readonly ActivityWithRenderer[] {
  // Create a memoized context of the createActivityRenderer function.
  const createActivityRendererMemoized = useMemoized(
    (activity: WebChatActivity, nextVisibleActivity: WebChatActivity) =>
      createActivityRenderer({ activity, nextVisibleActivity }),
    [createActivityRenderer]
  );

  const entries = useMemo(() => {
    const activitiesWithRenderer: ActivityWithRenderer[] = [];
    let nextVisibleActivity: WebChatActivity;

    for (let index = activities.length - 1; index >= 0; index--) {
      const activity = activities[+index];
      const renderActivity = createActivityRendererMemoized(activity, nextVisibleActivity);

      if (renderActivity) {
        activitiesWithRenderer.splice(0, 0, {
          activity,
          renderActivity
        });

        nextVisibleActivity = activity;
      }
    }

    return Object.freeze(activitiesWithRenderer);
  }, [activities, createActivityRendererMemoized]);

  return entries;
}
