import { hooks, type ActivityComponentFactory } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';
import { instance, map, object, optional, parse, pipe, readonly, string, type InferOutput } from 'valibot';
import useActivitiesWithRenderer from '../../providers/ActivityTree/private/useActivitiesWithRenderer';
import TranscriptActivity from '../TranscriptActivity';
import group from './private/group';
import mutableRefObject from './private/mutableRefObject';
import reactNode from './private/reactNode';
import RenderingElementsContext, { type RenderingElementsContextType } from './private/RenderingElementsContext';
import SenderGrouping from './ui/SenderGrouping/SenderGrouping';
import StatusGrouping from './ui/StatusGrouping/StatusGrouping';

const {
  useActivities,
  useActivityKeys,
  useGetActivitiesByKey,
  useCreateActivityRenderer,
  useGetKeyByActivity,
  useGroupActivities
} = hooks;

const renderingElementsComposerPropsSchema = pipe(
  object({
    activityElementMapRef: mutableRefObject(map(string(), instance(HTMLElement))),
    children: optional(reactNode()),
    grouping: string()
  }),
  readonly()
);

type ActivityWithRenderer = {
  activity: WebChatActivity;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
};

type RenderingElementsComposerProps = InferOutput<typeof renderingElementsComposerPropsSchema>;

function validateAllEntriesTagged<T>(entries: readonly T[], bins: readonly (readonly T[])[]): boolean {
  return entries.every(entry => bins.some(bin => bin.includes(entry)));
}

const RenderingElementsComposer = (props: RenderingElementsComposerProps) => {
  const { activityElementMapRef, children, grouping } = parse(renderingElementsComposerPropsSchema, props);

  const [rawActivities] = useActivities();
  const activityKeys = useActivityKeys();
  const createActivityRenderer: ActivityComponentFactory = useCreateActivityRenderer();
  const getActivitiesByKey = useGetActivitiesByKey();
  const getKeyByActivity = useGetKeyByActivity();
  const groupActivities = useGroupActivities();

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

  const entries = useActivitiesWithRenderer(activities, createActivityRenderer);

  const entryMap: Map<WebChatActivity, ActivityWithRenderer> = useMemo(
    () => new Map(entries.map(entry => [entry.activity, entry])),
    [entries]
  );

  const { entriesBySender, entriesByStatus } = useMemo<{
    entriesBySender: readonly (readonly ActivityWithRenderer[])[];
    entriesByStatus: readonly (readonly ActivityWithRenderer[])[];
  }>(() => {
    const visibleActivities = Object.freeze(Array.from(entryMap.keys()));

    const groupActivitiesResult = groupActivities({ activities: visibleActivities });

    const activitiesBySender = groupActivitiesResult?.sender || [];
    const activitiesByStatus = groupActivitiesResult?.status || [];

    const [entriesBySender, entriesByStatus] = [activitiesBySender, activitiesByStatus].map(bins =>
      bins.map(bin => bin.map(activity => entryMap.get(activity)))
    );

    if (!validateAllEntriesTagged(visibleActivities, activitiesBySender)) {
      console.warn(
        'botframework-webchat: Not every activities are grouped in the "sender" property. Please fix "groupActivitiesMiddleware" and group every activities.'
      );
    }

    if (!validateAllEntriesTagged(visibleActivities, activitiesByStatus)) {
      console.warn(
        'botframework-webchat: Not every activities are grouped in the "status" property. Please fix "groupActivitiesMiddleware" and group every activities.'
      );
    }

    return {
      entriesBySender,
      entriesByStatus
    };
  }, [entryMap, groupActivities]);

  const renderedActivitiesState = useMemo<readonly [ReactNode]>(
    () =>
      Object.freeze([
        group(entries, entry => entriesBySender.find(group => group.includes(entry))).map(entries => (
          <SenderGrouping
            activities={entries.map(({ activity }) => activity)}
            key={getKeyByActivity(entries[0].activity)}
          >
            {group(entries, entry => entriesByStatus.find(group => group.includes(entry))).map(entries => (
              <StatusGrouping
                activities={entries.map(({ activity }) => activity)}
                key={getKeyByActivity(entries[0].activity)}
              >
                {entries.map(({ activity, renderActivity }) => (
                  <TranscriptActivity
                    activity={activity}
                    key={getKeyByActivity(activity)}
                    renderActivity={renderActivity}
                  />
                ))}
              </StatusGrouping>
            ))}
          </SenderGrouping>
        ))
      ]),
    [entries, entriesBySender, entriesByStatus, getKeyByActivity]
  );

  const numRenderingActivitiesState = useMemo<readonly [number]>(
    () => Object.freeze([entries.length] as const),
    [entries]
  );

  const context = useMemo<RenderingElementsContextType>(
    () =>
      Object.freeze({
        activityElementMapRef,
        grouping,
        numRenderingActivitiesState,
        renderedActivitiesState
      }),
    [activityElementMapRef, grouping, numRenderingActivitiesState, renderedActivitiesState]
  );

  return <RenderingElementsContext.Provider value={context}>{children}</RenderingElementsContext.Provider>;
};

RenderingElementsComposer.displayName = 'RenderingElementsComposer';

export default memo(RenderingElementsComposer);

export { type RenderingElementsComposerProps };
