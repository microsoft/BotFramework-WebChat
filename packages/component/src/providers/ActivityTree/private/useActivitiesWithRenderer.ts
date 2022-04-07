import { useCallback, useRef } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import useMemoize from '../../../hooks/internal/useMemoize';
import type { ActivityWithRenderer } from './types';

export default function useActivitiesWithRenderer(
  activities: readonly WebChatActivity[],
  createActivityRenderer
): readonly ActivityWithRenderer[] {
  const createActivityRendererWithLiteralArgs = useCallback(
    (activity: WebChatActivity, nextVisibleActivity: WebChatActivity) =>
      createActivityRenderer({ activity, nextVisibleActivity }),
    [createActivityRenderer]
  );

  // Create a memoized context of the createActivityRenderer function.
  // TODO: [P2] Rename useMemoize to useMemoAll
  const entries = useMemoize(
    createActivityRendererWithLiteralArgs,
    createActivityRendererWithLiteralArgsMemoized => {
      // All calls to createActivityRendererWithLiteralArgsMemoized() in this function will be memoized (LRU = 1).
      // In the next render cycle, calls to createActivityRendererWithLiteralArgsMemoized() might return the memoized result instead.
      // This is an improvement to React useMemo(), because it only allows 1 memoization.
      // useMemoize() allows any number of memoization.

      const activitiesWithRenderer: ActivityWithRenderer[] = [];
      let nextVisibleActivity: WebChatActivity;

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

      return Object.freeze(activitiesWithRenderer);
    },
    [activities]
  );

  const prevEntriesRef = useRef<readonly ActivityWithRenderer[]>([]);
  const { current: prevEntries } = prevEntriesRef;

  if (
    prevEntries.length !== entries.length ||
    prevEntries.some((prevEntry, index) => {
      const entry = entries[+index];

      return entry.activity !== prevEntry.activity || entry.renderActivity !== prevEntry.renderActivity;
    })
  ) {
    prevEntriesRef.current = entries;
  }

  return prevEntriesRef.current;
}
