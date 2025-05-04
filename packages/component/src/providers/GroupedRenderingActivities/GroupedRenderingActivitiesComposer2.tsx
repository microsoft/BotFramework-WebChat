import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { object, optional, parse, pipe, readonly, type InferOutput } from 'valibot';

import reactNode from '../../types/internal/reactNode';
import useRenderingActivities from '../RenderingActivities/useRenderingActivities';
import { type GroupedRenderingActivities } from './GroupedRenderingActivities';
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

  const groupedRenderingActivitiesState = useMemo<readonly [readonly GroupedRenderingActivities[]]>(() => {
    const run = (
      activities: readonly WebChatActivity[],
      groups: readonly string[]
    ): readonly GroupedRenderingActivities[] => {
      const [name, ...nextNames] = groups;

      if (typeof name === 'undefined') {
        return Object.freeze([
          Object.freeze({
            activities,
            children: Object.freeze([]),
            key: getKeyByActivity(activities[0]),
            groupingName: undefined
          })
        ]);
      }

      const result = new Map(Object.entries(groupActivities({ activities })));

      let groupings: readonly (readonly WebChatActivity[])[];

      if (result.has(name)) {
        groupings = result.get(name);
      } else {
        console.warn(
          `botframework-webchat: styleOptions.groupActivitiesBy has "${name}" but groupActivitiesMiddleware does not return such result, assuming all activities are grouped by themselves`
        );

        groupings = Object.freeze(activities.map(activity => Object.freeze([activity])));
      }

      if (!validateAllEntriesTagged<WebChatActivity>(activities, groupings)) {
        `botframework-webchat: Not every activities are grouped in the "${name}" property. Please fix "groupActivitiesMiddleware" and group every activities`;
      }

      return Object.freeze(
        groupings.map(grouping =>
          Object.freeze({
            activities: grouping,
            children: run(grouping, nextNames),
            groupingName: name,
            key: getKeyByActivity(grouping[0])
          } satisfies GroupedRenderingActivities)
        )
      );
    };

    return Object.freeze([run(activities, groupActivitiesBy)]);
  }, [activities, getKeyByActivity, groupActivities, groupActivitiesBy]);

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
