import { hooks, type ActivityComponentFactory } from 'botframework-webchat-api';
import type { WebChatActivity } from 'botframework-webchat-core';
import React, { useMemo, useRef, type ReactNode } from 'react';

import useMemoWithPrevious from '../../hooks/internal/useMemoWithPrevious';
import ActivityTreeContext from './private/Context';
import { ActivityWithRenderer, ReadonlyActivityTree } from './private/types';
import useActivitiesWithRenderer from './private/useActivitiesWithRenderer';
import useActivityTreeWithRenderer from './private/useActivityTreeWithRenderer';
import useActivityTreeContext from './private/useContext';

import type { ActivityTreeContextType } from './private/Context';

type ActivityTreeComposerProps = Readonly<{ children?: ReactNode | undefined }>;

const {
  useActivities,
  useActivityKeys,
  useCreateActivityRenderer,
  useGetKeyByActivity,
  useReduceActivities,
  useGetActivityByKey
} = hooks;

const ActivityTreeComposer = ({ children }: ActivityTreeComposerProps) => {
  const existingContext = useActivityTreeContext(false);

  if (existingContext) {
    throw new Error('botframework-webchat internal: <ActivityTreeComposer> should not be nested.');
  }

  const [rawActivities] = useActivities();
  const getKeyByActivity = useGetKeyByActivity();
  const activityKeys = useActivityKeys();
  const getActivityByKey = useGetActivityByKey();
  const activityKeysSet = new Set(activityKeys[0]);

  // Persistent Map to store activities by their keys
  const activityMapRef = useRef<Readonly<Map<string, WebChatActivity>>>(
    Object.freeze(new Map<string, WebChatActivity>())
  );

  const activities =
    useReduceActivities<readonly WebChatActivity[]>((prevActivities = [], activity) => {
      if (!activityKeys) {
        return rawActivities;
      }

      // This is better than looping through all activities as bunch of stream activities will be clubbed
      // under single key and number of iteration will be significantly less.
      for (const key of activityMapRef.current.keys()) {
        if (!activityKeysSet.has(key)) {
          activityMapRef.current.delete(key);
        }
      }

      const activityKey = getKeyByActivity(activity);

      // we always want last revision of activity whether it is single or multiple."
      const lastActivity = getActivityByKey(activityKey);

      // TODO: We may want to send all revisions of activity to the middleware so they can render UI to see previous revisions.
      if (lastActivity === activity) {
        const activityMap = activityMapRef.current;

        // Update or add the activity in the persistent Map
        activityMap.set(activityKey, activity);

        // Return the updated activities as an array
        return Array.from(activityMap.values());
      }

      return prevActivities;
    }) || [];

  const createActivityRenderer: ActivityComponentFactory = useCreateActivityRenderer();

  const activitiesWithRenderer = useActivitiesWithRenderer(activities, createActivityRenderer);

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
      activityTreeWithRendererState: Object.freeze([activityTreeWithRenderer]) as readonly [ReadonlyActivityTree],
      flattenedActivityTreeWithRendererState: Object.freeze([flattenedActivityTreeWithRenderer]) as readonly [
        readonly ActivityWithRenderer[]
      ]
    }),
    [activityTreeWithRenderer, flattenedActivityTreeWithRenderer]
  );

  return <ActivityTreeContext.Provider value={contextValue}>{children}</ActivityTreeContext.Provider>;
};

export default ActivityTreeComposer;
