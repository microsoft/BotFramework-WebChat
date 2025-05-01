import { hooks, type ActivityComponentFactory } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';

import RenderingActivitiesContext, { type RenderingActivitiesContextType } from './private/RenderingActivitiesContext';
import useInternalActivitiesWithRenderer from './private/useInternalActivitiesWithRenderer';

type RenderingActivitiesComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const { useActivities, useActivityKeys, useCreateActivityRenderer, useGetActivitiesByKey, useGetKeyByActivity } = hooks;

const RenderingActivitiesComposer = ({ children }: RenderingActivitiesComposerProps) => {
  const [activities] = useActivities();
  const activityKeys = useActivityKeys();
  const createActivityRenderer = useCreateActivityRenderer();
  const getActivitiesByKey = useGetActivitiesByKey();
  const getKeyByActivity = useGetKeyByActivity();

  // TODO: Should move this logic into a new <LivestreamGrouping>.
  //       The grouping would only show the latest one but it has access to previous.
  const activitiesOfLatestRevision = useMemo<readonly WebChatActivity[]>(() => {
    const activitiesOfLatestRevision: WebChatActivity[] = [];

    if (!activityKeys) {
      return activities;
    }

    for (const activity of activities) {
      // If an activity has multiple revisions, display the latest revision only at the position of the first revision.

      // "Activities with same key" means "multiple revisions of same activity."
      const activitiesWithSameKey = getActivitiesByKey(getKeyByActivity(activity));

      // TODO: We may want to send all revisions of activity to the middleware so they can render UI to see previous revisions.
      activitiesWithSameKey?.[0] === activity &&
        activitiesOfLatestRevision.push(activitiesWithSameKey[activitiesWithSameKey.length - 1]);
    }

    return Object.freeze(activitiesOfLatestRevision);
  }, [activityKeys, getActivitiesByKey, getKeyByActivity, activities]);

  const activitiesWithRenderer = useInternalActivitiesWithRenderer(activitiesOfLatestRevision, createActivityRenderer);

  const renderingActivitiesState = useMemo(
    () => Object.freeze([activitiesWithRenderer.map(({ activity }) => activity)] as const),
    [activitiesWithRenderer]
  );

  const renderingActivityKeysState = useMemo<readonly [readonly string[]]>(() => {
    const keys = Object.freeze(renderingActivitiesState[0].map(activity => getKeyByActivity(activity)));

    if (keys.some(key => !key)) {
      throw new Error('botframework-webchat internal: activitiesWithRenderer[].activity must have activity key');
    }

    return Object.freeze([keys] as const);
  }, [renderingActivitiesState, getKeyByActivity]);

  const renderActivityCallbackMap = useMemo<
    ReadonlyMap<WebChatActivity, Exclude<ReturnType<ActivityComponentFactory>, false>>
  >(
    () =>
      Object.freeze(new Map(activitiesWithRenderer.map(({ activity, renderActivity }) => [activity, renderActivity]))),
    [activitiesWithRenderer]
  );

  const contextValue: RenderingActivitiesContextType = useMemo(
    () => ({
      renderActivityCallbackMap,
      renderingActivitiesState,
      renderingActivityKeysState
    }),
    [renderActivityCallbackMap, renderingActivitiesState, renderingActivityKeysState]
  );

  return <RenderingActivitiesContext.Provider value={contextValue}>{children}</RenderingActivitiesContext.Provider>;
};

RenderingActivitiesComposer.displayName = 'RenderingActivitiesComposer';

export default memo(RenderingActivitiesComposer);
export { type RenderingActivitiesComposerProps };
