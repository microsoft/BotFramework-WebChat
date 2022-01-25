import { hooks } from 'botframework-webchat-api';
import React, { useMemo } from 'react';

import type { ActivityComponentFactory } from 'botframework-webchat-api';
import type { DirectLineActivity } from 'botframework-webchat-core';
import type { FC, PropsWithChildren } from 'react';

import { ReadonlyActivityTree } from './private/types';
import ActivityTreeContext from './private/Context';
import useActivitiesWithRenderer from './private/useActivitiesWithRenderer';
import useActivityTreeContext from './private/useContext';
import useActivityTreeWithRenderer from './private/useActivityTreeWithRenderer';

import type { ActivityTreeContextType } from './private/Context';

type ActivityTreeComposerProps = PropsWithChildren<{}>;

const { useActivities, useCreateActivityRenderer } = hooks;

const ActivityTreeComposer: FC<ActivityTreeComposerProps> = ({ children }) => {
  const existingContext = useActivityTreeContext(false);

  if (existingContext) {
    throw new Error('botframework-webchat internal: <ActivityTreeComposer> should not be nested.');
  }

  const [activities]: [DirectLineActivity[]] = useActivities();
  const createActivityRenderer: ActivityComponentFactory = useCreateActivityRenderer();

  const activitiesWithRenderer = useActivitiesWithRenderer(activities, createActivityRenderer);

  const activityTreeWithRenderer = useActivityTreeWithRenderer(activitiesWithRenderer);

  const contextValue: ActivityTreeContextType = useMemo(
    () => ({
      activityTreeWithRendererState: Object.freeze([activityTreeWithRenderer]) as readonly [ReadonlyActivityTree]
    }),
    [activityTreeWithRenderer]
  );

  return <ActivityTreeContext.Provider value={contextValue}>{children}</ActivityTreeContext.Provider>;
};

export default ActivityTreeComposer;
