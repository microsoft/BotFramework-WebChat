import {
  useBuildRenderActivityCallback,
  type ActivityPolyMiddlewareRenderer
} from '@msinternal/botframework-webchat-middleware';
import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useCallback, useMemo, type ReactNode } from 'react';
import { useReduceMemo } from 'use-reduce-memo';

import RenderingActivitiesContext, { type RenderingActivitiesContextType } from './private/RenderingActivitiesContext';

type RenderingActivitiesComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const { useActivities, useActivityKeys, useGetActivitiesByKey, useGetKeyByActivity } = hooks;

const RenderingActivitiesComposer = ({ children }: RenderingActivitiesComposerProps) => {
  const [activities] = useActivities();
  const activityKeys = useActivityKeys();
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

  const renderActivity = useBuildRenderActivityCallback();

  const activityRendererMap = useReduceMemo(
    activitiesOfLatestRevision,
    useCallback<
      (
        activityRendererMap: ReadonlyMap<WebChatActivity, ActivityPolyMiddlewareRenderer>,
        activity: WebChatActivity
      ) => ReadonlyMap<WebChatActivity, ActivityPolyMiddlewareRenderer>
    >(
      (activityRendererMap, activity) => {
        const renderer = renderActivity({ activity });

        return renderer ? Object.freeze(new Map(activityRendererMap).set(activity, renderer)) : activityRendererMap;
      },
      [renderActivity]
    ),
    new Map<WebChatActivity, ActivityPolyMiddlewareRenderer>()
  );

  const renderingActivitiesState = useMemo<readonly [readonly WebChatActivity[]]>(
    () => Object.freeze([Object.freeze(Array.from(activityRendererMap.keys()))]),
    [activityRendererMap]
  );

  const renderingActivityKeysState = useMemo<readonly [readonly string[]]>(() => {
    const keys = Object.freeze(renderingActivitiesState[0].map(activity => getKeyByActivity(activity)));

    if (keys.some(key => !key)) {
      throw new Error('botframework-webchat internal: activityRendererMap[].activity must have activity key');
    }

    return Object.freeze([keys] as const);
  }, [getKeyByActivity, renderingActivitiesState]);

  const activityRendererMapState = useMemo<readonly [ReadonlyMap<WebChatActivity, ActivityPolyMiddlewareRenderer>]>(
    () => Object.freeze([activityRendererMap]),
    [activityRendererMap]
  );

  const contextValue: RenderingActivitiesContextType = useMemo(
    () => ({
      activityRendererMapState,
      renderingActivitiesState,
      renderingActivityKeysState
    }),
    [activityRendererMapState, renderingActivitiesState, renderingActivityKeysState]
  );

  return <RenderingActivitiesContext.Provider value={contextValue}>{children}</RenderingActivitiesContext.Provider>;
};

RenderingActivitiesComposer.displayName = 'RenderingActivitiesComposer';

export default memo(RenderingActivitiesComposer);
export { type RenderingActivitiesComposerProps };
