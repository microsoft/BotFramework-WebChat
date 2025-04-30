import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';
import { object, optional, parse, pipe, readonly, string, type InferOutput } from 'valibot';
import TranscriptActivity from '../../Transcript/TranscriptActivity';
import { type ActivityWithRenderer } from '../RenderingActivities/ActivityWithRenderer';
import useActivitiesWithRenderer from '../RenderingActivities/useActivitiesWithRenderer';
import group from './private/group';
import GroupedRenderingActivitiesContext, {
  type GroupedRenderingActivitiesContextType
} from './private/GroupedRenderingActivitiesContext';
import reactNode from './private/reactNode';
import SenderGrouping from './ui/SenderGrouping/SenderGrouping';
import StatusGrouping from './ui/StatusGrouping/StatusGrouping';

const { useGetKeyByActivity, useGroupActivities } = hooks;

const groupedRenderingActivitiesComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    grouping: string()
  }),
  readonly()
);

type GroupedRenderingActivitiesComposerProps = InferOutput<typeof groupedRenderingActivitiesComposerPropsSchema>;

function validateAllEntriesTagged<T>(entries: readonly T[], bins: readonly (readonly T[])[]): boolean {
  return entries.every(entry => bins.some(bin => bin.includes(entry)));
}

const GroupedRenderingActivitiesComposer = (props: GroupedRenderingActivitiesComposerProps) => {
  const { children, grouping } = parse(groupedRenderingActivitiesComposerPropsSchema, props);

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

  // TODO: Instead of returning ReactNode, return a structure instead.
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

  const context = useMemo<GroupedRenderingActivitiesContextType>(
    () =>
      Object.freeze({
        grouping,
        numRenderingActivitiesState,
        renderedActivitiesState
      }),
    [grouping, numRenderingActivitiesState, renderedActivitiesState]
  );

  return (
    <GroupedRenderingActivitiesContext.Provider value={context}>{children}</GroupedRenderingActivitiesContext.Provider>
  );
};

GroupedRenderingActivitiesComposer.displayName = 'GroupedRenderingActivitiesComposer';

export default memo(GroupedRenderingActivitiesComposer);
export { type GroupedRenderingActivitiesComposerProps };
