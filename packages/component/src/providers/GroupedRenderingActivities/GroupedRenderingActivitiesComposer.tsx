import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { object, optional, parse, pipe, readonly, type InferOutput } from 'valibot';

import reactNode from '../../types/internal/reactNode';
import useRenderingActivities from '../RenderingActivities/useRenderingActivities';
import { type GroupedRenderingActivities } from './GroupedRenderingActivities';
import group from './private/group';
import GroupedRenderingActivitiesContext, {
  type GroupedRenderingActivitiesContextType
} from './private/GroupedRenderingActivitiesContext';

const { useGetKeyByActivity, useGroupActivities, useStyleOptions } = hooks;

const groupedRenderingActivitiesComposerPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type GroupedRenderingActivitiesComposerProps = InferOutput<typeof groupedRenderingActivitiesComposerPropsSchema>;

function validateAllEntriesTagged<T>(entries: readonly T[], bins: readonly (readonly T[])[]): boolean {
  return entries.every(entry => bins.some(bin => bin.includes(entry)));
}

const GroupedRenderingActivitiesComposer = (props: GroupedRenderingActivitiesComposerProps) => {
  const { children } = parse(groupedRenderingActivitiesComposerPropsSchema, props);

  const [{ groupActivitiesBy }] = useStyleOptions();
  const [activities] = useRenderingActivities();
  const getKeyByActivity = useGetKeyByActivity();
  const groupActivities = useGroupActivities();

  const numRenderingActivitiesState = useMemo<readonly [number]>(
    () => Object.freeze([activities.length] as const),
    [activities]
  );

  const activitiesByGroupMap = useMemo<ReadonlyMap<string, readonly (readonly WebChatActivity[])[]>>(() => {
    const activitiesByGroupMap = Object.freeze(new Map(Object.entries(groupActivities({ activities }) || {})));

    for (const [key, value] of activitiesByGroupMap) {
      if (!validateAllEntriesTagged(activities, value)) {
        console.warn(
          `botframework-webchat: Not every activities are grouped in the "${key}" property. Please fix "groupActivitiesMiddleware" and group every activities`
        );
      }
    }

    return activitiesByGroupMap;
  }, [activities, groupActivities]);

  const groupedRenderingActivitiesState = useMemo<readonly [readonly GroupedRenderingActivities[]]>(() => {
    const run = (
      activities: readonly WebChatActivity[],
      groups: readonly string[]
    ): readonly GroupedRenderingActivities[] => {
      const [name, ...nextNames] = groups;

      if (!name) {
        return Object.freeze([
          Object.freeze({
            activities,
            children: Object.freeze([]),
            key: getKeyByActivity(activities[0]),
            groupingName: undefined
          })
        ]);
      }

      const activitiesByGroup: readonly (readonly WebChatActivity[])[] =
        activitiesByGroupMap.get(name) ?? Object.freeze(activities.map(activity => Object.freeze([activity])));

      return Object.freeze(
        group(activities, entry => Object.freeze(activitiesByGroup.find(group => group.includes(entry)))).map(
          groupedActivities =>
            Object.freeze({
              activities: Object.freeze(groupedActivities),
              children: run(groupedActivities, Object.freeze(nextNames)),
              key: getKeyByActivity(groupedActivities[0]),
              groupingName: name
            })
        )
      );
    };

    return Object.freeze([run(activities, Object.freeze(groupActivitiesBy))] as const);
  }, [activities, activitiesByGroupMap, getKeyByActivity, groupActivitiesBy]);

  const context = useMemo<GroupedRenderingActivitiesContextType>(
    () =>
      Object.freeze({
        groupedRenderingActivitiesState,
        numRenderingActivitiesState
      }),
    [groupedRenderingActivitiesState, numRenderingActivitiesState]
  );

  return (
    <GroupedRenderingActivitiesContext.Provider value={context}>{children}</GroupedRenderingActivitiesContext.Provider>
  );
};

GroupedRenderingActivitiesComposer.displayName = 'GroupedRenderingActivitiesComposer';

export default memo(GroupedRenderingActivitiesComposer);
export { type GroupedRenderingActivitiesComposerProps };
