import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

import type { ActivityComponentFactory } from 'botframework-webchat-api';
import type { DirectLineActivity } from 'botframework-webchat-core';

import useMemoize from './useMemoize';

const { useActivities, useCreateActivityRenderer } = hooks;

export type ActivityWithRenderer = {
  activity: DirectLineActivity;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
};

export default function useActivitiesWithRenderer(): [ActivityWithRenderer[]] {
  const [activities] = useActivities();
  const createActivityRenderer = useCreateActivityRenderer();

  const createActivityRendererWithLiteralArgs = useCallback(
    (activity: DirectLineActivity, nextVisibleActivity: DirectLineActivity) =>
      createActivityRenderer({ activity, nextVisibleActivity }),
    [createActivityRenderer]
  );

  // Create a memoized context of the createActivityRenderer function.
  return [
    // TODO: [P*] Rename useMemoize to useMemoAll
    useMemoize(
      createActivityRendererWithLiteralArgs,
      createActivityRendererWithLiteralArgsMemoized => {
        // All calls to createActivityRendererWithLiteralArgsMemoized() in this function will be memoized (LRU = 1).
        // In the next render cycle, calls to createActivityRendererWithLiteralArgsMemoized() might return the memoized result instead.
        // This is an improvement to React useMemo(), because it only allows 1 memoization.
        // useMemoize() allows any number of memoization.

        const activitiesWithRenderer: ActivityWithRenderer[] = [];
        let nextVisibleActivity: DirectLineActivity;

        for (let index = activities.length - 1; index >= 0; index--) {
          const activity = activities[+index];
          const renderActivity = createActivityRendererWithLiteralArgsMemoized(activity, nextVisibleActivity);

          if (renderActivity) {
            activitiesWithRenderer.splice(0, 0, {
              activity,
              renderActivity
            });

            nextVisibleActivity = activity;
          }
        }

        return activitiesWithRenderer;
      },
      [activities]
    )
  ];
}
