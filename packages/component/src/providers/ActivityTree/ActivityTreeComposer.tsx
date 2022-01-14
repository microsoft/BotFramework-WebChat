import { hooks } from 'botframework-webchat-api';
import React, { useMemo } from 'react';

import type { ActivityComponentFactory } from 'botframework-webchat-api';
import type { DirectLineActivity } from 'botframework-webchat-core';
import type { FC, PropsWithChildren } from 'react';

import ActivityTreeContext from './private/Context';
import useActivitiesWithRenderer from './private/useActivitiesWithRenderer';
import useActivityTreeWithRenderer from './private/useActivityTreeWithRenderer';
import useActivityTreeContext from './private/useContext';

import type { ActivityTreeContextType } from './private/Context';
import { ReadonlyActivityTree } from './private/types';

type ActivityTreeComposerProps = PropsWithChildren<{}>;

const { useActivities, useCreateActivityRenderer } = hooks;

const ActivityTreeComposer: FC<ActivityTreeComposerProps> = ({ children }) => {
  const existingContext = useActivityTreeContext(false);

  if (existingContext) {
    throw new Error('botframework-webchat internal: <ActivityTreeComposer> can only be defined once and not nested.');
  }

  const [activities]: [DirectLineActivity[]] = useActivities();
  const createActivityRenderer: ActivityComponentFactory = useCreateActivityRenderer();

  const activitiesWithRenderer = useActivitiesWithRenderer(activities, createActivityRenderer);

  const activityTreeWithRenderer = useActivityTreeWithRenderer(activitiesWithRenderer);

  const contextValue: ActivityTreeContextType = useMemo(
    () => ({ activityTreeWithRendererState: Object.freeze([activityTreeWithRenderer]) as [ReadonlyActivityTree] }),
    [activityTreeWithRenderer]
  );

  return <ActivityTreeContext.Provider value={contextValue}>{children}</ActivityTreeContext.Provider>;
};

export default ActivityTreeComposer;
