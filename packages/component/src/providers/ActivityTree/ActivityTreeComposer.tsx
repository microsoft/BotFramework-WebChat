import { hooks, type ActivityComponentFactory } from 'botframework-webchat-api';
import type { WebChatActivity } from 'botframework-webchat-core';
import React, { useMemo, type ReactNode } from 'react';

import useMemoWithPrevious from '../../hooks/internal/useMemoWithPrevious';
import useInternalActivitiesWithRenderer from './private/useInternalActivitiesWithRenderer';
import ActivityTreeContext from './private/Context';
import { ActivityWithRenderer, ReadonlyActivityTree } from './private/types';
import useActivityTreeWithRenderer from './private/useActivityTreeWithRenderer';
import useActivityTreeContext from './private/useContext';

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

  const activityTreeWithRenderer = useActivityTreeWithRenderer(activitiesWithRenderer);

  const flattenedActivityTreeWithRenderer = useMemoWithPrevious<Readonly<ActivityWithRenderer[]>>(
    prevFlattenedActivityTree => {
      const nextFlattenedActivityTree = Object.freeze(
        activityTreeWithRenderer.reduce<ActivityWithRenderer[]>(
          (intermediate, entriesWithSameSender) =>
            entriesWithSameSender.reduce<ActivityWithRenderer[]>(
              (intermediate, entriesWithSameSenderAndStatus) =>
                entriesWithSameSenderAndStatus.reduce<ActivityWithRenderer[]>((intermediate, entry) => {
                  intermediate.push(entry);

                  return intermediate;
                }, intermediate),
              intermediate
            ),
          []
        )
      );

      return nextFlattenedActivityTree.length === prevFlattenedActivityTree?.length &&
        nextFlattenedActivityTree.every((item, index) => item === prevFlattenedActivityTree[+index])
        ? prevFlattenedActivityTree
        : nextFlattenedActivityTree;
    },
    [activityTreeWithRenderer]
  );

  const contextValue: ActivityTreeContextType = useMemo(
    () => ({
      activitiesWithRenderer,
      activityTreeWithRendererState: Object.freeze([activityTreeWithRenderer]) as readonly [ReadonlyActivityTree],
      flattenedActivityTreeWithRendererState: Object.freeze([flattenedActivityTreeWithRenderer]) as readonly [
        readonly ActivityWithRenderer[]
      ]
    }),
    [activitiesWithRenderer, activityTreeWithRenderer, flattenedActivityTreeWithRenderer]
  );

  return <ActivityTreeContext.Provider value={contextValue}>{children}</ActivityTreeContext.Provider>;
};

export default ActivityTreeComposer;
