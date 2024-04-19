import { hooks } from 'botframework-webchat-api';
import React, { useMemo } from 'react';

import type { ActivityComponentFactory } from 'botframework-webchat-api';
import type { WebChatActivity } from 'botframework-webchat-core';
import type { FC, PropsWithChildren } from 'react';

import useMemoWithPrevious from '../../hooks/internal/useMemoWithPrevious';
import ActivityTreeContext from './private/Context';
import { ActivityWithRenderer, ReadonlyActivityTree } from './private/types';
import useActivitiesWithRenderer from './private/useActivitiesWithRenderer';
import useActivityTreeWithRenderer from './private/useActivityTreeWithRenderer';
import useActivityTreeContext from './private/useContext';

import type { ActivityTreeContextType } from './private/Context';

type ActivityTreeComposerProps = PropsWithChildren<{}>;

const { useActiveTyping, useActivities, useCreateActivityRenderer } = hooks;

const ActivityTreeComposer: FC<ActivityTreeComposerProps> = ({ children }) => {
  const existingContext = useActivityTreeContext(false);

  if (existingContext) {
    throw new Error('botframework-webchat internal: <ActivityTreeComposer> should not be nested.');
  }

  const [rawActivities]: [WebChatActivity[]] = useActivities();
  const [typings] = useActiveTyping();
  const typingMap = useMemo(() => new Map(Object.entries(typings)), [typings]);

  const activities = useMemo(() => {
    const activities = [];
    const lastTypingActivities = [...typingMap.values()].map(({ lastTypingActivity }) => lastTypingActivity);

    for (const activity of rawActivities) {
      // Display all activities except typing activity without text.
      if (activity.type !== 'typing' || (activity.text && lastTypingActivities.includes(activity))) {
        activities.push(activity);
      }
    }

    return Object.freeze(activities);
  }, [rawActivities, typingMap]);

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
