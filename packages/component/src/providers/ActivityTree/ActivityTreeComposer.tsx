import { hooks, type ActivityComponentFactory } from 'botframework-webchat-api';
import type { WebChatActivity } from 'botframework-webchat-core';
import React, { useMemo, type ReactNode } from 'react';

import ActivityTreeContext from './private/Context';
import useActivityTreeContext from './private/useContext';
import useInternalActivitiesWithRenderer from './private/useInternalActivitiesWithRenderer';

import type { ActivityTreeContextType } from './private/Context';

type ActivityTreeComposerProps = Readonly<{ children?: ReactNode | undefined }>;

const { useActivities, useActivityKeys, useCreateActivityRenderer, useGetActivitiesByKey, useGetKeyByActivity } = hooks;

const ActivityTreeComposer = ({ children }: ActivityTreeComposerProps) => {
  const existingContext = useActivityTreeContext(false);

  if (existingContext) {
    throw new Error('botframework-webchat internal: <ActivityTreeComposer> should not be nested.');
  }

  const [rawActivities] = useActivities();
  const getActivitiesByKey = useGetActivitiesByKey();
  const getKeyByActivity = useGetKeyByActivity();
  const activityKeys = useActivityKeys();

  // TODO: Should move this logic into a new <LivestreamGrouping>.
  //       The grouping would only show the latest one but it has access to previous.
  const activities = useMemo<readonly WebChatActivity[]>(() => {
    const activities: WebChatActivity[] = [];

    if (!activityKeys) {
      return rawActivities;
    }

    for (const activity of rawActivities) {
      // If an activity has multiple revisions, display the latest revision only at the position of the first revision.

      // "Activities with same key" means "multiple revisions of same activity."
      const activitiesWithSameKey = getActivitiesByKey(getKeyByActivity(activity));

      // TODO: We may want to send all revisions of activity to the middleware so they can render UI to see previous revisions.
      activitiesWithSameKey?.[0] === activity &&
        activities.push(activitiesWithSameKey[activitiesWithSameKey.length - 1]);
    }

    return Object.freeze(activities);
  }, [activityKeys, getActivitiesByKey, getKeyByActivity, rawActivities]);

  const createActivityRenderer: ActivityComponentFactory = useCreateActivityRenderer();

  const activitiesWithRenderer = useInternalActivitiesWithRenderer(activities, createActivityRenderer);

  const renderingActivityKeysState = useMemo<readonly [readonly string[]]>(() => {
    const keys = Object.freeze(activitiesWithRenderer.map(({ activity }) => getKeyByActivity(activity)));

    if (keys.some(key => !key)) {
      throw new Error('botframework-webchat: assert activitiesWithRenderer[].activity must have activity key');
    }

    return Object.freeze([keys] as const);
  }, [activitiesWithRenderer, getKeyByActivity]);

  const contextValue: ActivityTreeContextType = useMemo(
    () => ({
      activitiesWithRenderer,
      renderingActivityKeysState
    }),
    [activitiesWithRenderer, renderingActivityKeysState]
  );

  return <ActivityTreeContext.Provider value={contextValue}>{children}</ActivityTreeContext.Provider>;
};

export default ActivityTreeComposer;
