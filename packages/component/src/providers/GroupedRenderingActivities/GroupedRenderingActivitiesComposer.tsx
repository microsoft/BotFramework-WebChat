import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { array, object, optional, parse, pipe, readonly, string, type InferOutput } from 'valibot';

import reactNode from '../../types/internal/reactNode';
import useRenderingActivities from '../RenderingActivities/useRenderingActivities';
import { type GroupedRenderingActivities } from './GroupedRenderingActivities';
import group from './private/group';
import GroupedRenderingActivitiesContext, {
  type GroupedRenderingActivitiesContextType
} from './private/GroupedRenderingActivitiesContext';

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

  const [activities] = useRenderingActivities();
  const getKeyByActivity = useGetKeyByActivity();
  const groupActivities = useGroupActivities('map');
  const groupingState = useMemo(() => Object.freeze([grouping] as const), [grouping]);

  const numRenderingActivitiesState = useMemo<readonly [number]>(
    () => Object.freeze([activities.length] as const),
    [activities]
  );

  const activitiesByGroupMap = useMemo<ReadonlyMap<string, readonly (readonly WebChatActivity[])[]>>(() => {
    const activitiesByGroupMap = new Map<string, readonly (readonly WebChatActivity[])[]>();

    for (const [key, value] of groupActivities({ activities })) {
      if (!validateAllEntriesTagged(activities, value)) {
        console.warn(
          `botframework-webchat: Not every activities are grouped in the "${key}" property. Please fix "groupActivitiesMiddleware" and group every activities`
        );
      }

      activitiesByGroupMap.set(key, value);
    }

    return Object.freeze(activitiesByGroupMap);
  }, [activities, groupActivities]);

  const groupedRenderingActivitiesState = useMemo<readonly [readonly GroupedRenderingActivities[]]>(() => {
    function run(
      activities: readonly WebChatActivity[],
      groups: readonly string[]
    ): readonly GroupedRenderingActivities[] {
      const [currentGroup, ...nextGroups] = groups;

      if (!currentGroup) {
        return Object.freeze([
          {
            activities,
            children: Object.freeze([]),
            key: getKeyByActivity(activities[0]),
            type: ''
          }
        ]);
      }

      const activitiesByGroup: readonly (readonly WebChatActivity[])[] =
        activitiesByGroupMap.get(currentGroup) ?? Object.freeze(activities.map(activity => Object.freeze([activity])));

      return Object.freeze(
        group(activities, entry => Object.freeze(activitiesByGroup.find(group => group.includes(entry)))).map(
          groupedActivities =>
            Object.freeze({
              activities: Object.freeze(groupedActivities),
              children: run(groupedActivities, Object.freeze(nextGroups)),
              key: getKeyByActivity(groupedActivities[0]),
              type: currentGroup
            })
        )
      );
    }

    return Object.freeze([run(activities, Object.freeze(grouping))] as const);
  }, [activities, activitiesByGroupMap, getKeyByActivity, grouping]);

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
