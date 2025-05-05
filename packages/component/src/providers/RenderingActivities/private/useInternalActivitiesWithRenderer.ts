import { type ActivityComponentFactory } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import { useMemo } from 'react';

import useMemoWithPrevious from '../../../hooks/internal/useMemoWithPrevious';

type ActivityWithRenderer = Readonly<{
  activity: WebChatActivity;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
}>;

type Call = Readonly<{
  activity: WebChatActivity;
  nextVisibleActivity: WebChatActivity;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
}>;

type Run = Readonly<{
  createActivityRenderer: ActivityComponentFactory;
  calls: readonly Call[];
}>;

export default function useInternalActivitiesWithRenderer(
  activities: readonly WebChatActivity[],
  createActivityRenderer: ActivityComponentFactory
): readonly ActivityWithRenderer[] {
  const run = useMemoWithPrevious<Run>(
    prevRun => {
      if (prevRun && !Object.is(prevRun.createActivityRenderer, createActivityRenderer)) {
        // If `createActivityRenderer` changed, invalidate the cache.
        prevRun = undefined;
      }

      const calls: Call[] = [];
      let nextVisibleActivity: undefined | WebChatActivity;

      for (let index = activities.length - 1; index >= 0; index--) {
        const activity = activities[+index];

        const prevEntry = prevRun?.calls.find(
          entry => Object.is(activity, entry.activity) && Object.is(nextVisibleActivity, entry.nextVisibleActivity)
        );

        if (prevEntry) {
          calls.unshift(prevEntry);

          nextVisibleActivity = activity;
        } else {
          const renderActivity = createActivityRenderer({ activity, nextVisibleActivity });

          if (renderActivity) {
            calls.unshift(
              Object.freeze({
                activity,
                nextVisibleActivity,
                renderActivity
              })
            );

            nextVisibleActivity = activity;
          }
        }
      }

      return Object.freeze({ createActivityRenderer, calls: Object.freeze(calls) });
    },
    [activities, createActivityRenderer]
  );

  return useMemo(
    () =>
      run.calls.map<ActivityWithRenderer>(call => ({
        activity: call.activity,
        renderActivity: call.renderActivity
      })),
    [run]
  );
}
