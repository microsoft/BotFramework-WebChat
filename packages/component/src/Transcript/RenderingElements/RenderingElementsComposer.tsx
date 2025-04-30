import { hooks, type ActivityComponentFactory } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';
import { object, optional, parse, pipe, readonly, string, type InferOutput } from 'valibot';
import useActivitiesWithRenderer from '../../providers/ActivityTree/useActivitiesWithRenderer';
import TranscriptActivity from '../TranscriptActivity';
import group from './private/group';
import reactNode from './private/reactNode';
import RenderingElementsContext, { type RenderingElementsContextType } from './private/RenderingElementsContext';
import SenderGrouping from './ui/SenderGrouping/SenderGrouping';
import StatusGrouping from './ui/StatusGrouping/StatusGrouping';

const { useGetKeyByActivity, useGroupActivities } = hooks;

const renderingElementsComposerPropsSchema = pipe(
  object({
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
  const { children, grouping } = parse(renderingElementsComposerPropsSchema, props);

  const getKeyByActivity = useGetKeyByActivity();
  const groupActivities = useGroupActivities();

  const entries = useActivitiesWithRenderer();

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
        grouping,
        numRenderingActivitiesState,
        renderedActivitiesState
      }),
    [grouping, numRenderingActivitiesState, renderedActivitiesState]
  );

  return <RenderingElementsContext.Provider value={context}>{children}</RenderingElementsContext.Provider>;
};

RenderingElementsComposer.displayName = 'RenderingElementsComposer';

export default memo(RenderingElementsComposer);
export { type RenderingElementsComposerProps };
