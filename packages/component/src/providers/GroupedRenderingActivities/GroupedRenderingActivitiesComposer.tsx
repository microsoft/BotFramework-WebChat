import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { array, object, optional, parse, pipe, readonly, string, type InferOutput } from 'valibot';

import { type ActivityWithRenderer } from '../RenderingActivities/ActivityWithRenderer';
import useActivitiesWithRenderer from '../RenderingActivities/useActivitiesWithRenderer';
import { type GroupedRenderingActivities } from './GroupedRenderingActivities';
import group from './private/group';
import GroupedRenderingActivitiesContext, {
  type GroupedRenderingActivitiesContextType
} from './private/GroupedRenderingActivitiesContext';
import reactNode from '../../types/internal/reactNode';

const { useGetKeyByActivity, useGroupActivities } = hooks;

const groupedRenderingActivitiesComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    grouping: pipe(array(string()), readonly())
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
  const groupActivities = useGroupActivities('map');
  const groupingState = useMemo(() => Object.freeze([grouping] as const), [grouping]);
  const entries = useActivitiesWithRenderer();

  const entryMap: Map<WebChatActivity, ActivityWithRenderer> = useMemo(
    () => new Map(entries.map(entry => [entry.activity, entry])),
    [entries]
  );
  const numRenderingActivitiesState = useMemo<readonly [number]>(
    () => Object.freeze([entries.length] as const),
    [entries]
  );

  const entriesByGroupMap = useMemo<ReadonlyMap<string, readonly (readonly ActivityWithRenderer[])[]>>(() => {
    const entriesByGroupMap = new Map<string, readonly (readonly ActivityWithRenderer[])[]>();
    const renderingActivities = Object.freeze(Array.from(entryMap.keys()));

    for (const [key, activities] of groupActivities({ activities: renderingActivities })) {
      if (!validateAllEntriesTagged(renderingActivities, activities)) {
        console.warn(
          `botframework-webchat: Not every activities are grouped in the "${key}" property. Please fix "groupActivitiesMiddleware" and group every activities`
        );
      }

      entriesByGroupMap.set(
        key,
        activities.map(bin => bin.map(activity => entryMap.get(activity)))
      );
    }

    return Object.freeze(entriesByGroupMap);
  }, [entryMap, groupActivities]);

  const groupedRenderingActivitiesState = useMemo<readonly [readonly GroupedRenderingActivities[]]>(() => {
    function run(
      entries: readonly ActivityWithRenderer[],
      groups: readonly string[]
    ): readonly GroupedRenderingActivities[] {
      const [currentGroup, ...nextGroups] = groups;

      if (!currentGroup) {
        return Object.freeze([
          {
            activitiesWithRenderer: entries,
            children: Object.freeze([]),
            key: getKeyByActivity(entries[0].activity),
            type: ''
          }
        ]);
      }

      const entriesByGroup: readonly (readonly ActivityWithRenderer[])[] =
        entriesByGroupMap.get(currentGroup) ?? Object.freeze(entries.map(entry => Object.freeze([entry])));

      return Object.freeze(
        group(entries, entry => Object.freeze(entriesByGroup.find(group => group.includes(entry)))).map(
          groupedEntries =>
            Object.freeze({
              activitiesWithRenderer: Object.freeze(groupedEntries),
              children: run(groupedEntries, Object.freeze(nextGroups)),
              key: getKeyByActivity(groupedEntries[0].activity),
              type: currentGroup
            })
        )
      );
    }

    return Object.freeze([run(entries, Object.freeze(grouping))] as const);
  }, [entries, entriesByGroupMap, getKeyByActivity, grouping]);

  const context = useMemo<GroupedRenderingActivitiesContextType>(
    () =>
      Object.freeze({
        groupedRenderingActivitiesState,
        groupingState,
        numRenderingActivitiesState
      }),
    [groupedRenderingActivitiesState, groupingState, numRenderingActivitiesState]
  );

  return (
    <GroupedRenderingActivitiesContext.Provider value={context}>{children}</GroupedRenderingActivitiesContext.Provider>
  );
};

GroupedRenderingActivitiesComposer.displayName = 'GroupedRenderingActivitiesComposer';

export default memo(GroupedRenderingActivitiesComposer);
export { type GroupedRenderingActivitiesComposerProps };
